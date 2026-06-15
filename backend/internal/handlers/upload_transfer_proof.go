package handlers

import (
	"database/sql"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"path/filepath"
	"pendaftaran-uib/backend/internal/audit"
	"pendaftaran-uib/backend/internal/auth"
	"pendaftaran-uib/backend/internal/clamav"
	"pendaftaran-uib/backend/internal/i18n"
	"pendaftaran-uib/backend/internal/models"
	"pendaftaran-uib/backend/internal/utils"
	"strconv"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

func GetTransferProofs(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		lang := utils.Lang(r)
		claims := auth.GetClaims(r)
		if claims == nil {
			utils.WriteJSON(w, http.StatusUnauthorized, utils.ErrJSON(i18n.T("common.unauthorized", lang)))
			return
		}

		regIDStr := chi.URLParam(r, "regID")
		regID, err := uuid.Parse(regIDStr)
		if err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON(i18n.T("common.invalid_request", lang)))
			return
		}

		userID, err := uuid.Parse(claims.Subject)
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}

		var card models.RegistrationCardDTO
		var fullName, email, nik string
		var currentProdiCode, currentSession sql.NullString

		err = db.QueryRowContext(r.Context(), `
			SELECT
				u.full_name, u.email, u.nik,
				reg.id, reg.status, reg.examinee_id,
				g.batch_key, g.batch_name, g.degree, g.batch_type,
				gd.academic_year,
				DATE_FORMAT(gd.event_date, '%Y-%m-%d'),
				TIME_FORMAT(gd.start_time, '%H:%i'),
				DATE_FORMAT(gd.registration_end, '%Y-%m-%d'),
				ps.code,
				COALESCE(rs1.class_session, 'PAGI')
			FROM registration reg
			INNER JOIN users u ON u.id = reg.user_id
			INNER JOIN gelombang g ON g.id = reg.gelombang_id
			INNER JOIN gelombang_detail gd ON gd.gelombang_id = g.id
			LEFT JOIN registration_s1_detail rs1 ON rs1.registration_id = reg.id
			LEFT JOIN registration_s2_detail rs2 ON rs2.registration_id = reg.id
			LEFT JOIN program_studi ps ON ps.id = COALESCE(rs1.program_studi_id, rs2.program_studi_id)
			WHERE reg.id = ? AND reg.user_id = ?`,
			regID[:], userID[:],
		).Scan(
			&fullName, &email, &nik,
			&card.RegistrationID, &card.Status, &card.ExamineeID,
			&card.BatchKey, &card.BatchName, &card.Degree, &card.BatchType,
			&card.AcademicYear, &card.EventDate, &card.StartTime, &card.RegistrationEnd,
			&currentProdiCode, &currentSession,
		)

		if errors.Is(err, sql.ErrNoRows) {
			utils.WriteJSON(w, http.StatusNotFound, utils.ErrJSON(i18n.T("registration.not_found", lang)))
			return
		}
		if err != nil {
			slog.Error("get_transfer_proofs: query error", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}

		paymentRows, err := db.QueryContext(r.Context(), `
			SELECT id, status, account_holder, bank_name, amount, file_path, file_name, file_size_bytes, DATE_FORMAT(payment_date, '%Y-%m-%d'), uploaded_at
			FROM registration_tuition_fee
			WHERE registration_id = ?
			ORDER BY uploaded_at DESC`,
			regID[:],
		)
		if err != nil {
			slog.Error("get_transfer_proofs: query payments error", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}
		defer paymentRows.Close()

		var payments []models.TuitionFee
		for paymentRows.Next() {
			var p models.TuitionFee

			if err := paymentRows.Scan(
				&p.ID, &p.Status, &p.AccountHolder, &p.BankName, &p.Amount,
				&p.FilePath, &p.FileName, &p.FileSizeBytes, &p.PaymentDate,
				&p.UploadedAt,
			); err != nil {
				slog.Error("get_transfer_proofs: scan payment error", "error", err)
				utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
				return
			}
			p.RegistrationID = regID.String()
			payments = append(payments, p)
		}

		prodiTitle := "-"
		if currentProdiCode.Valid {
			prodiTitle = i18n.T("program."+currentProdiCode.String+".title", lang)
		}

		utils.WriteJSON(w, http.StatusOK, map[string]any{
			"registration": card,
			"payments":     payments,
			"user": map[string]string{
				"full_name": fullName,
				"email":     email,
				"nik":       decryptAndMask(nik),
			},
			"current_prodi":   prodiTitle,
			"current_session": currentSession.String,
		})
	}
}

func UploadTransferProof(db *sql.DB, storageDir string, scanner *clamav.Client, al *audit.Logger) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		lang := utils.Lang(r)
		claims := auth.GetClaims(r)
		if claims == nil {
			utils.WriteJSON(w, http.StatusUnauthorized, utils.ErrJSON(i18n.T("common.unauthorized", lang)))
			return
		}

		regIDStr := chi.URLParam(r, "regID")
		regID, err := uuid.Parse(regIDStr)
		if err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON(i18n.T("common.invalid_request", lang)))
			return
		}

		userID, err := uuid.Parse(claims.Subject)
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}

		// Verify registration belongs to user
		var id uuid.UUID
		err = db.QueryRowContext(r.Context(), "SELECT id FROM registration WHERE id = ? AND user_id = ?", regID[:], userID[:]).Scan(&id)
		if err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				utils.WriteJSON(w, http.StatusNotFound, utils.ErrJSON(i18n.T("registration.not_found", lang)))
				return
			}
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}

		if err := r.ParseMultipartForm(maxUploadSize); err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON(i18n.T("common.invalid_request", lang)))
			return
		}

		pemilikRekening := strings.TrimSpace(r.FormValue("pemilikRekening"))
		bankName := strings.TrimSpace(r.FormValue("bank"))
		amountStr := strings.TrimSpace(r.FormValue("amount"))

		if pemilikRekening == "" || bankName == "" {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON(i18n.T("common.invalid_request", lang)))
			return
		}

		amount, _ := strconv.ParseUint(amountStr, 10, 64)
		if amount == 0 {
			// Try to get default amount from gelombang? For now just allow it or set a default
			amount = 300000
		}

		file, header, err := r.FormFile("file")
		if err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON(i18n.T("registration.file_required", lang)))
			return
		}
		defer file.Close()

		targetDir := filepath.Join(storageDir, "registrations", userID.String(), regID.String(), "payments")
		encFilename, err := utils.FormatEncryptedPDFFileBuilder("tuition_fee")
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}

		cfg := utils.UploadConfig{
			TargetDir:  targetDir,
			TargetName: encFilename,
			MaxBytes:   maxUploadSize,
		}

		size, err := utils.SaveFile(r.Context(), file, header, cfg, scanner)
		if err != nil {
			if errors.Is(err, utils.ErrMalwareDetected) {
				utils.WriteJSON(w, http.StatusUnprocessableEntity, utils.ErrJSON(i18n.T("common.malware_detected", lang)))
				return
			}
			if errors.Is(err, utils.ErrInvalidType) {
				utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON(i18n.T("common.invalid_file_type", lang)))
				return
			}
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}

		_, err = db.ExecContext(r.Context(), `
			INSERT INTO registration_tuition_fee (
				registration_id, status, account_holder, bank_name, amount,
				file_path, file_name, file_size_bytes, payment_date
			) VALUES (?, 'PENDING', ?, ?, ?, ?, ?, ?, ?)`,
			regID[:], pemilikRekening, bankName, amount,
			filepath.Join("registrations", userID.String(), regID.String(), "payments", encFilename),
			header.Filename, size, time.Now().Format("2006-01-02"),
		)

		if err != nil {
			slog.Error("upload_transfer_proof: db error", "error", err)
			_ = os.Remove(filepath.Join(targetDir, encFilename))
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}

		al.Log(audit.Entry{
			Event:     audit.EventRegistrationUploadDocument,
			UserID:    userID.String(),
			IP:        utils.RealIP(r),
			UserAgent: r.UserAgent(),
			RequestID: chi.URLParam(r, "requestId"),
			Meta:      map[string]any{"registration_id": regID.String(), "type": "transfer_proof"},
		})

		utils.WriteJSON(w, http.StatusOK, map[string]string{"message": i18n.T("registration.upload_success", lang)})
	}
}


