package main

import (
	"context"
	"database/sql"
	"errors"
	"flag"
	"fmt"
	"log/slog"
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
	"pendaftaran-uib/backend/internal/db"
	"pendaftaran-uib/backend/internal/loa"

	"github.com/google/uuid"
)

func main() {
	ctx := context.Background()

	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}))
	slog.SetDefault(logger)

	if err := godotenv.Load(); err != nil {
		slog.Error("error loading .env file", "error", err)
		os.Exit(1)
	}

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

	case "loa-set-assessment":
		if len(os.Args) < 3 {
			slog.Error("missing required registration_id target positional argument", "command", commandVerb)
			printUsage()
			os.Exit(1)
		}
		cmdLoaSetAssessment(ctx, provider.MySQL, os.Args[2:])

	case "prodi-list":
		cmdProdiList(ctx, provider.MySQL, os.Args[2:])
	case "prodi-approve":
		if len(os.Args) < 3 {
			slog.Error("missing required request_id positional argument", "command", commandVerb)
			printUsage()
			os.Exit(1)
		}
		cmdProdiApprove(ctx, provider.MySQL, os.Args[2:])
	case "prodi-reject":
		if len(os.Args) < 3 {
			slog.Error("missing required request_id positional argument", "command", commandVerb)
			printUsage()
			os.Exit(1)
		}
		cmdProdiReject(ctx, provider.MySQL, os.Args[2:])

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
          For S1: automatically computes and stores fee breakdown in registration_loa_fee.
          Requires assessment (usm_rank) to be set via loa-set-assessment first.

  reject  <registration_id> [--feedback-document="..."] [--feedback-payment="..."]
          Reject an application back to applicants with targeted remediation logs.

  reset   <registration_id>
          Emergency reset back to a blank slate DRAFT state, clearing old sequences/feedback.

  loa-set-assessment  <registration_id> [S1 flags] [S2 flags]
          Set or update the USM assessment for a VERIFIED registration before LoA generation.

          S1 flags:
            --usm-rank=<1-5>          USM result rank (1=best, 5=worst)
            --scholarship=<1-7>       Scholarship ID (optional; omit for no scholarship)

          S2 flags:
            --s2-package=<1-3>        S2 package ID (1=Umum, 2=Sivitas/Alumni, 3=FastTrack)
            --no-matriculation        Waive the matriculation fee (default: required)

          The command detects degree (S1 or S2) automatically from the registration.

  prodi-list  [--status=PENDING|APPROVED|REJECTED] [--limit=20]
		  List major change requests with applicant details.

  prodi-approve  <request_id>
		  Approve a pending major change request. Updates registration_s1_detail.

  prodi-reject   <request_id>
  		  Reject a pending major change request with optional reason.`)
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

	regID := parseRegID(positionalArgs[0])

	var degree string
	err := dbConn.QueryRowContext(ctx,
		`SELECT g.degree FROM registration r
		 INNER JOIN gelombang g ON g.id = r.gelombang_id
		 WHERE r.id = ? AND r.status = 'SUBMITTED'`,
		regID[:],
	).Scan(&degree)
	if err == sql.ErrNoRows {
		fmt.Println("Action aborted: registration must be in 'SUBMITTED' status to verify.")
		os.Exit(1)
	}
	if err != nil {
		slog.Error("degree lookup failed", "error", err)
		os.Exit(1)
	}

	if degree == "S1" {
		var rankSet bool
		_ = dbConn.QueryRowContext(ctx,
			`SELECT usm_rank IS NOT NULL
			 FROM registration_s1_assessment
			 WHERE registration_id = ?`,
			regID[:],
		).Scan(&rankSet)

		if !rankSet {
			fmt.Println("Action aborted: S1 registration requires usm_rank before verify.")
			fmt.Printf("  Set it first:  admincli loa-set-assessment %s --usm-rank=<1-5>\n", regID.String())
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

	if degree == "S1" {
		if err := computeAndStoreFeeS1InTx(ctx, dbConn, tx, regID); err != nil {
			slog.Error("fee calculation failed — verify will still commit but LoA will need manual recalc",
				"reg_id", regID.String(), "error", err)
		} else {
			fmt.Println("Fee breakdown computed and stored.")
		}
	}

	if err := tx.Commit(); err != nil {
		slog.Error("commit failed", "error", err)
		os.Exit(1)
	}
	committed = true

	fmt.Printf("Verified successfully. Examinee ID assigned: %s\n", examineeID)
}

func computeAndStoreFeeS1InTx(ctx context.Context, db *sql.DB, tx *sql.Tx, regID uuid.UUID) error {
	var prodiID uuid.UUID
	var gelombangNumber int
	var usmRank sql.NullInt64
	var scholarshipID sql.NullInt64

	err := db.QueryRowContext(ctx, `
		SELECT
			s1.program_studi_id,
			g.batch_number,
			a.usm_rank,
			a.scholarship_id
		FROM registration r
		INNER JOIN gelombang g ON g.id = r.gelombang_id
		INNER JOIN registration_s1_detail s1 ON s1.registration_id = r.id
		LEFT  JOIN registration_s1_assessment a ON a.registration_id = r.id
		WHERE r.id = ?`,
		regID[:],
	).Scan(&prodiID, &gelombangNumber, &usmRank, &scholarshipID)
	if err != nil {
		return fmt.Errorf("fee input lookup: %w", err)
	}
	if !usmRank.Valid {
		return loa.ErrInvalidAssessment
	}

	var bppPokok, perSKS, basePPL, labFee int
	err = db.QueryRowContext(ctx, `
		SELECT bpp_pokok, per_sks_cost, base_ppl, lab_fee
		FROM master_s1_prodi_fee WHERE program_studi_id = ?`,
		prodiID[:],
	).Scan(&bppPokok, &perSKS, &basePPL, &labFee)
	if err != nil {
		return fmt.Errorf("prodi fee: %w", err)
	}

	var sppAmount int
	err = db.QueryRowContext(ctx, `
		SELECT spp_amount FROM master_s1_spp_matrix
		WHERE gelombang_number = ? AND usm_rank = ?`,
		gelombangNumber, usmRank.Int64,
	).Scan(&sppAmount)
	if err != nil {
		return fmt.Errorf("spp matrix: %w", err)
	}

	const defaultSKS = 20
	bppSKS := perSKS * defaultSKS

	var discSPPPct, discPPLPct, discBPPPct, discSKSPct float64
	if scholarshipID.Valid {
		_ = db.QueryRowContext(ctx, `
			SELECT spp_discount_pct, ppl_discount_pct, bpp_discount_pct, sks_discount_pct
			FROM master_s1_scholarship WHERE id = ?`,
			scholarshipID.Int64,
		).Scan(&discSPPPct, &discPPLPct, &discBPPPct, &discSKSPct)
	}

	f := &loa.S1FeeBreakdown{
		SPP:              sppAmount,
		PPL:              basePPL,
		BPPPokok:         bppPokok,
		BPPSKS:           bppSKS,
		BPPPraktikum:     labFee,
		DiscountSPP:      int(float64(sppAmount) * discSPPPct / 100),
		DiscountPPL:      int(float64(basePPL) * discPPLPct / 100),
		DiscountBPPPokok: int(float64(bppPokok) * discBPPPct / 100),
		DiscountBPPSKS:   int(float64(bppSKS) * discSKSPct / 100),
	}

	return loa.StoreFeeS1(ctx, tx, regID, f)
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

	regID := parseRegID(positionalArgs[0])

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

	regID := parseRegID(positionalArgs[0])

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

func cmdLoaSetAssessment(ctx context.Context, dbConn *sql.DB, args []string) {
	fs := flag.NewFlagSet("loa-set-assessment", flag.ContinueOnError)
	usmRankFlag := fs.Int("usm-rank", 0, "S1: USM rank (1=best … 5=worst)")
	scholarshipFlag := fs.Int("scholarship", 0, "S1: scholarship ID (0 = no scholarship)")
	s2PackageFlag := fs.Int("s2-package", 0, "S2: package ID")
	noMatriculationFlag := fs.Bool("no-matriculation", false, "S2: waive matriculation fee")

	if err := fs.Parse(args); err != nil {
		os.Exit(1)
	}

	positionalArgs := fs.Args()
	if len(positionalArgs) < 1 {
		fmt.Println("Usage: admincli loa-set-assessment <registration_id> [flags]")
		os.Exit(1)
	}

	regID := parseRegID(positionalArgs[0])

	var degree string
	err := dbConn.QueryRowContext(ctx,
		`SELECT g.degree FROM registration r
		 INNER JOIN gelombang g ON g.id = r.gelombang_id
		 WHERE r.id = ?`,
		regID[:],
	).Scan(&degree)
	if err == sql.ErrNoRows {
		fmt.Printf("Error: registration %s not found.\n", regID.String())
		os.Exit(1)
	}
	if err != nil {
		slog.Error("degree lookup failed", "error", err)
		os.Exit(1)
	}

	switch degree {
	case "S1":
		if *usmRankFlag == 0 {
			fmt.Println("Error: --usm-rank is required for S1 registrations (1-5).")
			os.Exit(1)
		}
		if *usmRankFlag < 1 || *usmRankFlag > 5 {
			fmt.Println("Error: --usm-rank must be between 1 and 5.")
			os.Exit(1)
		}
		setS1Assessment(ctx, dbConn, regID, *usmRankFlag, *scholarshipFlag)

	case "S2":
		if *s2PackageFlag == 0 {
			fmt.Println("Error: --s2-package is required for S2 registrations (1, 2, or 3).")
			os.Exit(1)
		}
		setS2Assessment(ctx, dbConn, regID, *s2PackageFlag, !*noMatriculationFlag)

	default:
		fmt.Printf("Error: unknown degree %q for this registration.\n", degree)
		os.Exit(1)
	}
}

func setS1Assessment(ctx context.Context, db *sql.DB, regID uuid.UUID, usmRank, scholarshipID int) {
	var scholarshipArg any
	if scholarshipID > 0 {
		scholarshipArg = scholarshipID
	}

	_, err := db.ExecContext(ctx, `
		INSERT INTO registration_s1_assessment (registration_id, usm_rank, scholarship_id)
		VALUES (?, ?, ?)
		ON DUPLICATE KEY UPDATE
			usm_rank      = VALUES(usm_rank),
			scholarship_id = VALUES(scholarship_id)`,
		regID[:], usmRank, scholarshipArg,
	)
	if err != nil {
		slog.Error("set s1 assessment failed", "error", err)
		os.Exit(1)
	}

	scholarshipLabel := "none"
	if scholarshipID > 0 {
		scholarshipLabel = strconv.Itoa(scholarshipID)
	}
	fmt.Printf("S1 assessment set: usm_rank=%d, scholarship_id=%s\n", usmRank, scholarshipLabel)
	fmt.Println("Run 'admincli verify' to finalize and auto-compute fee breakdown.")
}

func setS2Assessment(ctx context.Context, db *sql.DB, regID uuid.UUID, packageID int, isMatriculation bool) {
	_, err := db.ExecContext(ctx, `
		INSERT INTO registration_s2_assessment (registration_id, s2_package_id, is_matriculation_required)
		VALUES (?, ?, ?)
		ON DUPLICATE KEY UPDATE
			s2_package_id             = VALUES(s2_package_id),
			is_matriculation_required = VALUES(is_matriculation_required)`,
		regID[:], packageID, isMatriculation,
	)
	if err != nil {
		slog.Error("set s2 assessment failed", "error", err)
		os.Exit(1)
	}

	matLabel := "yes"
	if !isMatriculation {
		matLabel = "no"
	}
	fmt.Printf("S2 assessment set: package_id=%d, matriculation=%s\n", packageID, matLabel)
}

func parseRegID(s string) uuid.UUID {
	id, err := uuid.Parse(s)
	if err != nil {
		id, err = uuid.Parse(strings.ReplaceAll(s, "-", ""))
		if err != nil {
			slog.Error("invalid registration id format", "error", err)
			os.Exit(1)
		}
	}
	return id
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

func cmdProdiList(ctx context.Context, dbConn *sql.DB, args []string) {
	fs := flag.NewFlagSet("prodi-list", flag.ContinueOnError)
	statusFlag := fs.String("status", "", "Filter by status (PENDING, APPROVED, REJECTED)")
	limitFlag := fs.Int("limit", 20, "Maximum rows")

	if err := fs.Parse(args); err != nil {
		os.Exit(1)
	}

	query := `
		SELECT
			mcr.id,
			u.email,
			u.full_name,
			g.batch_name,
			old_ps.code,
			mcr.old_session,
			new_ps.code,
			mcr.new_session,
			mcr.status,
			mcr.requested_at
		FROM major_change_request mcr
		INNER JOIN registration reg ON reg.id = mcr.registration_id
		INNER JOIN users u ON u.id = reg.user_id
		INNER JOIN gelombang g ON g.id = reg.gelombang_id
		LEFT  JOIN program_studi old_ps ON old_ps.id = mcr.old_program_studi_id
		LEFT  JOIN program_studi new_ps ON new_ps.id = mcr.new_program_studi_id
		WHERE 1=1`
	var params []any

	if *statusFlag != "" {
		query += " AND mcr.status = ?"
		params = append(params, strings.ToUpper(*statusFlag))
	}

	query += " ORDER BY mcr.requested_at DESC LIMIT ?"
	params = append(params, *limitFlag)

	rows, err := dbConn.QueryContext(ctx, query, params...)
	if err != nil {
		slog.Error("prodi-list query failed", "error", err)
		os.Exit(1)
	}
	defer rows.Close()

	fmt.Printf("%-6s %-30s %-25s %-20s %-20s %-8s %-20s %-8s %-10s %s\n",
		"ID", "EMAIL", "NAME", "BATCH", "OLD_PRODI", "OLD_SES", "NEW_PRODI", "NEW_SES", "STATUS", "REQUESTED")
	fmt.Println(strings.Repeat("-", 170))

	for rows.Next() {
		var id int64
		var email, fullName, batchName, oldProdi, oldSession, newProdi, newSession, status, requestedAt string

		if err := rows.Scan(&id, &email, &fullName, &batchName, &oldProdi, &oldSession,
			&newProdi, &newSession, &status, &requestedAt); err != nil {
			slog.Error("prodi-list scan failed", "error", err)
			os.Exit(1)
		}

		cleanTime := requestedAt
		if len(cleanTime) > 19 {
			cleanTime = cleanTime[:19]
		}

		fmt.Printf("%-6d %-30s %-25s %-20s %-20s %-8s %-20s %-8s %-10s %s\n",
			id, email, truncate(fullName, 23), truncate(batchName, 18),
			truncate(oldProdi, 18), oldSession, truncate(newProdi, 18), newSession,
			status, cleanTime)
	}

	if err := rows.Err(); err != nil {
		slog.Error("prodi-list rows error", "error", err)
		os.Exit(1)
	}
}

func cmdProdiApprove(ctx context.Context, dbConn *sql.DB, args []string) {
	requestID, err := strconv.ParseInt(args[0], 10, 64)
	if err != nil {
		slog.Error("invalid request_id", "error", err)
		os.Exit(1)
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

	var regID uuid.UUID
	var newProdiID uuid.UUID
	var newSession string
	var status string

	err = tx.QueryRowContext(ctx, `
		SELECT registration_id, new_program_studi_id, new_session, status
		FROM major_change_request WHERE id = ? FOR UPDATE`,
		requestID,
	).Scan(&regID, &newProdiID, &newSession, &status)

	if errors.Is(err, sql.ErrNoRows) {
		fmt.Println("Error: request not found.")
		os.Exit(1)
	}
	if err != nil {
		slog.Error("lookup request failed", "error", err)
		os.Exit(1)
	}

	if status != "PENDING" {
		fmt.Printf("Action aborted: request is already %s.\n", status)
		os.Exit(1)
	}

	_, err = tx.ExecContext(ctx, `
		UPDATE registration_s1_detail
		SET program_studi_id = ?, class_session = ?
		WHERE registration_id = ?`,
		newProdiID[:], newSession, regID[:],
	)
	if err != nil {
		slog.Error("update registration_s1_detail failed", "error", err)
		os.Exit(1)
	}

	_, err = tx.ExecContext(ctx, `
		UPDATE major_change_request
		SET status = 'APPROVED', updated_at = NOW()
		WHERE id = ?`,
		requestID,
	)
	if err != nil {
		slog.Error("update request status failed", "error", err)
		os.Exit(1)
	}

	if err := tx.Commit(); err != nil {
		slog.Error("commit failed", "error", err)
		os.Exit(1)
	}
	committed = true

	fmt.Printf("Request #%d approved. Registration %s updated to new program studi.\n",
		requestID, regID.String())
}

func cmdProdiReject(ctx context.Context, dbConn *sql.DB, args []string) {
	if len(args) < 1 {
		fmt.Println("Usage: prodi-reject <request_id>")
		os.Exit(1)
	}

	requestID, err := strconv.ParseInt(args[0], 10, 64)
	if err != nil {
		slog.Error("invalid request_id", "error", err)
		os.Exit(1)
	}

	res, err := dbConn.ExecContext(ctx, `
		UPDATE major_change_request
		SET status = 'REJECTED', updated_at = NOW()
		WHERE id = ? AND status = 'PENDING'`,
		requestID,
	)
	if err != nil {
		slog.Error("reject request failed", "error", err)
		os.Exit(1)
	}

	rowsAffected, _ := res.RowsAffected()
	if rowsAffected == 0 {
		fmt.Println("Action aborted: request not found or already processed.")
		os.Exit(1)
	}

	fmt.Printf("Request #%d rejected.\n", requestID)
}
