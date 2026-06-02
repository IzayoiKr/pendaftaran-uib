package handlers

import (
	"database/sql"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"path/filepath"
	"pendaftaran-uib/backend/internal/auth"
	"pendaftaran-uib/backend/internal/clamav"
	"pendaftaran-uib/backend/internal/crypto"
	"pendaftaran-uib/backend/internal/i18n"
	"pendaftaran-uib/backend/internal/models"
	"pendaftaran-uib/backend/internal/utils"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

func GetTransferProof(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		lang := utils.Lang(r)
		claims := auth.GetClaims(r)
		if claims == nil {
			utils.WriteJSON(w, http.StatusUnauthorized, utils.ErrJSON(i18n.T("common.unauthorized", lang)))
			return
		}

		userID, err := uuid.Parse(claims.UserID)
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}

		regIDStr := r.URL.Query().Get("regID")
		var regID *uuid.UUID
		if regIDStr != "" {
			parsed, err := uuid.Parse(regIDStr)
			if err == nil {
				regID = &parsed
			}
		}

		// Get the most recent transfer proof for the user or specific registration
		var tp models.TransferProofDTO
		var paymentDate time.Time
		var uploadedAt time.Time

		query := `
			SELECT tf.registration_id, tf.account_holder, tf.bank_name, tf.amount, tf.status, tf.file_name, tf.payment_date, tf.uploaded_at
			FROM registration_tuition_fee tf
			INNER JOIN registration reg ON reg.id = tf.registration_id
			WHERE reg.user_id = ?`
		
		args := []any{userID[:]}

		if regID != nil {
			query += " AND tf.registration_id = ?"
			args = append(args, (*regID)[:])
		}

		query += " ORDER BY tf.uploaded_at DESC LIMIT 1"

		err = db.QueryRowContext(r.Context(), query, args...).Scan(
			&tp.RegistrationID, &tp.AccountHolder, &tp.BankName, &tp.Amount, &tp.Status, &tp.FileName, &paymentDate, &uploadedAt,
		)

		if errors.Is(err, sql.ErrNoRows) {
			utils.WriteJSON(w, http.StatusNotFound, utils.ErrJSON(i18n.T("registration.not_found", lang)))
			return
		}
		if err != nil {
			slog.Error("get_transfer_proof: query error", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}

		tp.PaymentDate = paymentDate.Format("2006-01-02")
		tp.UploadedAt = uploadedAt.Format("2006-01-02 15:04:05")

		utils.WriteJSON(w, http.StatusOK, tp)
	}
}

func ServeTransferProof(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		lang := utils.Lang(r)
		claims := auth.GetClaims(r)
		if claims == nil {
			utils.WriteJSON(w, http.StatusUnauthorized, utils.ErrJSON(i18n.T("common.unauthorized", lang)))
			return
		}

		userID, err := uuid.Parse(claims.UserID)
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}

		regIDStr := chi.URLParam(r, "regID")
		regID, err := uuid.Parse(regIDStr)
		if err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON(i18n.T("common.invalid_request", lang)))
			return
		}

		var filePath, fileName string
		err = db.QueryRowContext(r.Context(), `
			SELECT tf.file_path, tf.file_name
			FROM registration_tuition_fee tf
			INNER JOIN registration reg ON reg.id = tf.registration_id
			WHERE reg.id = ? AND reg.user_id = ?
			ORDER BY tf.uploaded_at DESC LIMIT 1`,
			regID[:], userID[:],
		).Scan(&filePath, &fileName)

		if errors.Is(err, sql.ErrNoRows) {
			utils.WriteJSON(w, http.StatusNotFound, utils.ErrJSON(i18n.T("registration.not_found", lang)))
			return
		}
		if err != nil {
			slog.Error("serve_transfer_proof: query error", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}

		f, err := os.Open(filePath)
		if err != nil {
			slog.Error("serve_transfer_proof: open file", "path", filePath, "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}
		defer f.Close()

		w.Header().Set("Content-Type", "application/pdf")
		w.Header().Set("Content-Disposition", "inline; filename=\""+fileName+"\"")
		w.Header().Set("Cache-Control", "private, no-cache, no-store, must-revalidate")

		if err := crypto.DecryptStream(f, w); err != nil {
			slog.Error("serve_transfer_proof: decrypt error", "path", filePath, "error", err)
			// Too late to send JSON error if headers already sent, but DecryptStream usually fails early or late
		}
	}
}

func UploadTransferProof(db *sql.DB, scanner *clamav.Client, storageDir string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		lang := utils.Lang(r)
		claims := auth.GetClaims(r)
		if claims == nil {
			utils.WriteJSON(w, http.StatusUnauthorized, utils.ErrJSON(i18n.T("common.unauthorized", lang)))
			return
		}

		userID, err := uuid.Parse(claims.UserID)
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}

		const maxUploadSize = 5 << 20
		if err := r.ParseMultipartForm(maxUploadSize); err != nil {
			slog.Error("upload_transfer_proof: parse multipart", "error", err)
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON(i18n.T("common.invalid_request", lang)))
			return
		}

		amountFloat, _ := strconv.ParseFloat(r.FormValue("amount"), 64)
		req := models.TransferProofRequest{
			AccountHolder: r.FormValue("accountHolder"),
			BankName:      r.FormValue("bankName"),
			Amount:        uint64(amountFloat),
			PaymentDate:   r.FormValue("paymentDate"),
		}

		req.Sanitize()

		if err := utils.ValidateStruct(req, lang); err != nil {
			slog.Warn("upload_transfer_proof: validation failed", "error", err)
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON(err.Error()))
			return
		}

		paymentDate, _ := time.Parse("2006-01-02", req.PaymentDate)

		file, header, err := r.FormFile("file")
		if err != nil {
			slog.Error("upload_transfer_proof: get file", "error", err)
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON(i18n.T("common.invalid_request", lang)))
			return
		}
		defer file.Close()

		// Get registration ID from form
		regIDStr := r.FormValue("registrationID")
		if regIDStr == "" {
			slog.Warn("upload_transfer_proof: missing registrationID")
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON(i18n.T("common.invalid_request", lang)))
			return
		}
		regID, err := uuid.Parse(regIDStr)
		if err != nil {
			slog.Warn("upload_transfer_proof: invalid registrationID", "value", regIDStr, "error", err)
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON(i18n.T("common.invalid_request", lang)))
			return
		}

		// Verify registration belongs to user
		var dummy int
		err = db.QueryRowContext(r.Context(),
			"SELECT 1 FROM registration WHERE id = ? AND user_id = ?",
			regID[:], userID[:],
		).Scan(&dummy)
		if errors.Is(err, sql.ErrNoRows) {
			utils.WriteJSON(w, http.StatusForbidden, utils.ErrJSON(i18n.T("common.forbidden", lang)))
			return
		}
		if err != nil {
			slog.Error("upload_transfer_proof: verify registration", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}

		// Process file
		targetPath := filepath.Join(storageDir, "enrollment_transfer_proof", userID.String(), regID.String())
		if err := os.MkdirAll(targetPath, 0755); err != nil {
			slog.Error("upload_transfer_proof: mkdir error", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}

		fileName := utils.GenerateUUIDString() + ".pdf.enc"
		cfg := utils.UploadConfig{
			TargetDir:  targetPath,
			TargetName: fileName,
			MaxBytes:   maxUploadSize,
		}

		size, err := utils.SaveFile(r.Context(), file, header, cfg, scanner)
		if err != nil {
			if errors.Is(err, utils.ErrMalwareDetected) {
				utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON(i18n.T("validation.malware_detected", lang)))
				return
			}
			if errors.Is(err, utils.ErrFileTooLarge) {
				utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON(i18n.T("validation.max", lang)))
				return
			}
			if errors.Is(err, utils.ErrInvalidType) {
				utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON(i18n.T("validation.invalid_file_type", lang)))
				return
			}
			slog.Error("upload_transfer_proof: save file", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}

		finalPath := filepath.Join(cfg.TargetDir, cfg.TargetName)

		_, err = db.ExecContext(r.Context(), `
			INSERT INTO registration_tuition_fee (
				registration_id, account_holder, bank_name, amount, payment_date,
				file_path, file_name, file_size_bytes, status
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')`,
			regID[:], req.AccountHolder, req.BankName, req.Amount, paymentDate,
			finalPath, header.Filename, uint64(size),
		)

		if err != nil {
			slog.Error("upload_transfer_proof: insert db", "error", err)
			_ = os.Remove(finalPath)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}

		utils.WriteJSON(w, http.StatusCreated, map[string]string{"message": "success"})
	}
}
