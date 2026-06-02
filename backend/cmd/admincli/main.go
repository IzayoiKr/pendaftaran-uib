package main

import (
	"context"
	"database/sql"
	"flag"
	"fmt"
	"log/slog"
	"os"
	"strings"

	"github.com/joho/godotenv"
	"pendaftaran-uib/backend/internal/db"

	"github.com/google/uuid"
)

func main() {
	ctx := context.Background()

	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}))
	slog.SetDefault(logger)

	_ = godotenv.Load() // Ignore error if .env doesn't exist

	provider, err := db.NewProvider(ctx)
	if err != nil {
		slog.Error("db init failed", "error", err)
		os.Exit(1)
	}
	defer provider.Close(ctx)

	if len(os.Args) < 2 {
		printUsage()
		os.Exit(1)
	}

	commandVerb := os.Args[1]

	switch commandVerb {
	case "list":
		cmdList(ctx, provider.MySQL, os.Args[2:])

	case "verify", "reject", "reset":
		if len(os.Args) < 3 {
			slog.Error("missing required registration_id target positional argument", "command", commandVerb)
			printUsage()
			os.Exit(1)
		}

		switch commandVerb {
		case "verify":
			cmdVerify(ctx, provider.MySQL, os.Args[2:])
		case "reject":
			cmdReject(ctx, provider.MySQL, os.Args[2:])
		case "reset":
			cmdReset(ctx, provider.MySQL, os.Args[2:])
		}

	default:
		slog.Error("unrecognized or invalid administration tool instruction", "input", commandVerb)
		printUsage()
		os.Exit(1)
	}
}

func printUsage() {
	fmt.Println(`Usage: admincli <command> [args]

Commands:
  list    [--status=draft|submitted|rejected|verified] [--email=...] [--limit=20]
          Search active registrations with clean human-readable viewports.

  verify  <registration_id>
          Verify a submitted application. Automates sequence-safe examinee_id assignment.

  reject  <registration_id> [--feedback-document="..."] [--feedback-payment="..."]
          Reject an application back to applicants with targeted remediation logs.

  reset   <registration_id>
          Emergency reset back to a blank slate DRAFT state, clearing old sequences/feedback.`)
}

func cmdList(ctx context.Context, dbConn *sql.DB, args []string) {
	fs := flag.NewFlagSet("list", flag.ContinueOnError)
	statusFlag := fs.String("status", "", "Filter registrations by status (DRAFT, SUBMITTED, REJECTED, VERIFIED)")
	emailFlag := fs.String("email", "", "Filter registrations by user email lookup pattern")
	limitFlag := fs.Int("limit", 20, "Maximum number of rows to return to the viewport")

	if err := fs.Parse(args); err != nil {
		os.Exit(1)
	}

	query := `
		SELECT 
			r.id,
			u.email,
			u.full_name,
			g.batch_name,
			g.degree,
			r.status,
			r.examinee_id,
			r.created_at
		FROM registration r
		INNER JOIN users u ON u.id = r.user_id
		INNER JOIN gelombang g ON g.id = r.gelombang_id
		WHERE 1=1`
	var params []any

	if *statusFlag != "" {
		query += " AND r.status = ?"
		params = append(params, strings.ToUpper(*statusFlag))
	}
	if *emailFlag != "" {
		query += " AND u.email LIKE ?"
		params = append(params, "%"+*emailFlag+"%")
	}

	query += " ORDER BY r.created_at DESC LIMIT ?"
	params = append(params, *limitFlag)

	rows, err := dbConn.QueryContext(ctx, query, params...)
	if err != nil {
		slog.Error("list query failed", "error", err)
		os.Exit(1)
	}
	defer rows.Close()

	fmt.Printf("%-36s %-30s %-25s %-20s %-6s %-10s %-12s %s\n",
		"REG_ID", "EMAIL", "NAME", "BATCH", "DEGREE", "STATUS", "EXAMINEE_ID", "CREATED")
	fmt.Println(strings.Repeat("-", 155))

	for rows.Next() {
		var regID uuid.UUID
		var rowEmail, rowFullName, rowBatchName, rowDegree, rowStatus string
		var rowExamineeID sql.NullString
		var rowCreatedAt string

		if err := rows.Scan(
			&regID, &rowEmail, &rowFullName, &rowBatchName, &rowDegree, &rowStatus,
			&rowExamineeID, &rowCreatedAt,
		); err != nil {
			slog.Error("failed to scan row data", "error", err)
			os.Exit(1)
		}

		examNum := "-"
		if rowExamineeID.Valid {
			examNum = rowExamineeID.String
		}

		cleanTime := rowCreatedAt
		if len(cleanTime) > 19 {
			cleanTime = cleanTime[:19]
		}

		fmt.Printf("%-36s %-30s %-25s %-20s %-6s %-10s %-12s %s\n",
			regID.String(), rowEmail, truncate(rowFullName, 23), truncate(rowBatchName, 18),
			rowDegree, rowStatus, examNum, cleanTime)
	}

	if err := rows.Err(); err != nil {
		slog.Error("rows iteration error", "error", err)
		os.Exit(1)
	}
}

func cmdVerify(ctx context.Context, dbConn *sql.DB, args []string) {
	fs := flag.NewFlagSet("verify", flag.ContinueOnError)
	if err := fs.Parse(args); err != nil {
		os.Exit(1)
	}

	positionalArgs := fs.Args()
	if len(positionalArgs) < 1 {
		fmt.Println("Usage: admincli verify <registration_id>")
		os.Exit(1)
	}

	regIDHex := positionalArgs[0]
	regID, err := uuid.Parse(regIDHex)
	if err != nil {
		regID, err = uuid.Parse(strings.ReplaceAll(regIDHex, "-", ""))
		if err != nil {
			slog.Error("invalid registration id format", "error", err)
			os.Exit(1)
		}
	}

	tx, err := dbConn.BeginTx(ctx, nil)
	if err != nil {
		slog.Error("begin tx failed", "error", err)
		os.Exit(1)
	}
	committed := false
	defer func() {
		if !committed {
			_ = tx.Rollback()
		}
	}()

	examineeID := generateExamineeID(ctx, tx, regID)

	res, err := tx.ExecContext(ctx, `
		UPDATE registration 
		SET status = 'VERIFIED', examinee_id = ?, updated_at = NOW()
		WHERE id = ? AND status = 'SUBMITTED'`,
		examineeID, regID[:],
	)
	if err != nil {
		slog.Error("verify database update failed", "error", err)
		os.Exit(1)
	}

	rowsAffected, err := res.RowsAffected()
	if err != nil {
		slog.Error("failed to fetch rows affected count", "error", err)
		os.Exit(1)
	}

	if rowsAffected == 0 {
		fmt.Println("Action aborted: registration must be in 'SUBMITTED' status to verify.")
		os.Exit(1)
	}

	if err := tx.Commit(); err != nil {
		slog.Error("commit failed", "error", err)
		os.Exit(1)
	}
	committed = true

	fmt.Printf("Verified successfully. Examinee ID assigned: %s\n", examineeID)
}

func cmdReject(ctx context.Context, dbConn *sql.DB, args []string) {
	fs := flag.NewFlagSet("reject", flag.ContinueOnError)
	fbDocFlag := fs.String("feedback-document", "", "Feedback notes for invalid or blurred documentation")
	fbPayFlag := fs.String("feedback-payment", "", "Feedback notes for insufficient or missing payment slips")

	if err := fs.Parse(args); err != nil {
		os.Exit(1)
	}

	positionalArgs := fs.Args()
	if len(positionalArgs) < 1 {
		fmt.Println("Usage: admincli reject <registration_id> [--feedback-document='...'] [--feedback-payment='...']")
		os.Exit(1)
	}

	regIDHex := positionalArgs[0]
	regID, err := uuid.Parse(regIDHex)
	if err != nil {
		regID, err = uuid.Parse(strings.ReplaceAll(regIDHex, "-", ""))
		if err != nil {
			slog.Error("invalid registration id format", "error", err)
			os.Exit(1)
		}
	}

	inputDoc := strings.TrimSpace(*fbDocFlag)
	inputPay := strings.TrimSpace(*fbPayFlag)

	tx, err := dbConn.BeginTx(ctx, nil)
	if err != nil {
		slog.Error("begin tx failed", "error", err)
		os.Exit(1)
	}
	committed := false
	defer func() {
		if !committed {
			_ = tx.Rollback()
		}
	}()

	var existingDoc, existingPay sql.NullString
	err = tx.QueryRowContext(ctx,
		"SELECT feedback_document, feedback_payment FROM registration WHERE id = ? FOR UPDATE",
		regID[:],
	).Scan(&existingDoc, &existingPay)
	if err != nil {
		if err == sql.ErrNoRows {
			fmt.Println("Error: registration record not found.")
		} else {
			slog.Error("lookup failed", "error", err)
		}
		os.Exit(1)
	}

	finalDoc := inputDoc
	if finalDoc == "" && existingDoc.Valid {
		finalDoc = existingDoc.String
	}
	finalPay := inputPay
	if finalPay == "" && existingPay.Valid {
		finalPay = existingPay.String
	}

	if strings.TrimSpace(finalDoc) == "" && strings.TrimSpace(finalPay) == "" {
		fmt.Println("Error: rejecting requires at least one feedback comment.")
		os.Exit(1)
	}

	res, err := tx.ExecContext(ctx, `
		UPDATE registration 
		SET status = 'REJECTED',
		    feedback_document = ?,
		    feedback_payment = ?,
		    updated_at = NOW()
		WHERE id = ? AND status = 'SUBMITTED'`,
		finalDoc, finalPay, regID[:],
	)
	if err != nil {
		slog.Error("reject failed", "error", err)
		os.Exit(1)
	}

	rowsAffected, err := res.RowsAffected()
	if err != nil {
		slog.Error("failed to fetch rows affected count", "error", err)
		os.Exit(1)
	}

	if rowsAffected == 0 {
		fmt.Println("Action aborted: registration must be in 'SUBMITTED' status to reject.")
		os.Exit(1)
	}

	if err := tx.Commit(); err != nil {
		slog.Error("commit failed", "error", err)
		os.Exit(1)
	}
	committed = true

	fmt.Println("Rejected successfully. Feedback logged for applicant access.")
}

func cmdReset(ctx context.Context, dbConn *sql.DB, args []string) {
	fs := flag.NewFlagSet("reset", flag.ContinueOnError)
	if err := fs.Parse(args); err != nil {
		os.Exit(1)
	}

	positionalArgs := fs.Args()
	if len(positionalArgs) < 1 {
		fmt.Println("Usage: admincli reset <registration_id>")
		os.Exit(1)
	}

	regIDHex := positionalArgs[0]
	regID, err := uuid.Parse(regIDHex)
	if err != nil {
		regID, err = uuid.Parse(strings.ReplaceAll(regIDHex, "-", ""))
		if err != nil {
			slog.Error("invalid registration id format", "error", err)
			os.Exit(1)
		}
	}

	res, err := dbConn.ExecContext(ctx, `
		UPDATE registration 
		SET status = 'DRAFT', 
		    examinee_id = NULL,
		    feedback_document = NULL,
		    feedback_payment = NULL,
		    updated_at = NOW()
		WHERE id = ? AND status IN ('SUBMITTED', 'REJECTED')`,
		regID[:],
	)
	if err != nil {
		slog.Error("emergency reset operation failed", "error", err)
		os.Exit(1)
	}

	rowsAffected, err := res.RowsAffected()
	if err != nil {
		slog.Error("failed to retrieve rows affected metadata", "error", err)
		os.Exit(1)
	}

	if rowsAffected == 0 {
		fmt.Println("Action aborted: No eligible registration found (must be SUBMITTED or REJECTED).")
		os.Exit(1)
	}

	fmt.Printf("Emergency reset completed successfully. Registration %s is now in DRAFT status.\n", regID.String())
}

func truncate(s string, n int) string {
	runes := []rune(s)
	if len(runes) <= n {
		return s
	}
	return string(runes[:n-3]) + "..."
}

func generateExamineeID(ctx context.Context, tx *sql.Tx, regID uuid.UUID) string {
	var location, batchType string
	var academicYear int
	var gelombangID uuid.UUID

	err := tx.QueryRowContext(ctx, `
		SELECT gd.location, gd.academic_year, g.id, g.batch_type
		FROM registration r
		INNER JOIN gelombang g ON g.id = r.gelombang_id
		INNER JOIN gelombang_detail gd ON gd.gelombang_id = g.id
		WHERE r.id = ? LIMIT 1`,
		regID[:],
	).Scan(&location, &academicYear, &gelombangID, &batchType)
	if err != nil {
		if err == sql.ErrNoRows {
			slog.Error("registration not found", "reg_id", regID.String())
		} else {
			slog.Error("metadata lookup failed", "error", err)
		}
		os.Exit(1)
	}

	var prefixXX string
	switch location {
	case "Batam":
		prefixXX = "BM"
	case "Online":
		prefixXX = "OL"
	case "Tanjung Pinang":
		prefixXX = "TP"
	default:
		slog.Error("invalid or missing location profile value", "location", location)
		os.Exit(1)
	}

	prefixYY := fmt.Sprintf("%02d", academicYear%100)

	var typeT string
	switch batchType {
	case "Reguler":
		typeT = "1"
	case "Beasiswa":
		typeT = "2"
	default:
		slog.Error("invalid or unknown batch type value", "batch_type", batchType)
		os.Exit(1)
	}

	prefixKey := fmt.Sprintf("%s%s%s", prefixXX, prefixYY, typeT)
	var assignedSequence int

	_, err = tx.ExecContext(ctx, `
		INSERT INTO examinee_sequence (gelombang_id, prefix_key, next_value) 
		VALUES (?, ?, 1)
		ON DUPLICATE KEY UPDATE next_value = LAST_INSERT_ID(next_value + 1)`,
		gelombangID[:], prefixKey,
	)
	if err != nil {
		slog.Error("failed to increment batch sequence counter", "error", err)
		os.Exit(1)
	}

	err = tx.QueryRowContext(ctx, "SELECT LAST_INSERT_ID()").Scan(&assignedSequence)
	if err != nil {
		slog.Error("failed to scan batch sequence id pointer", "error", err)
		os.Exit(1)
	}

	if assignedSequence == 0 {
		assignedSequence = 1
	}

	return fmt.Sprintf("%s%04d", prefixKey, assignedSequence)
}
