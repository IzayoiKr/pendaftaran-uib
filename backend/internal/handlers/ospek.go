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
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

func GetOspekPrerequisite(db *sql.DB) http.HandlerFunc {
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

		var op models.OspekPrerequisiteDTO
		var uploadedAt time.Time
		var verifiedAt sql.NullTime
		var notes sql.NullString
		var pasFotoName sql.NullString
		var ijazahName sql.NullString
		var studyProgram sql.NullString
		var degree string

		// Get active registration and its ospek prerequisite if any
		query := `
			SELECT 
				r.id, u.full_name, u.email, u.nik, 
				g.batch_name, g.degree, gd.academic_year,
				ps.title as study_program,
				op.pas_foto_name, op.ijazah_name, COALESCE(op.status, 'PENDING'), 
				op.notes, COALESCE(op.uploaded_at, r.created_at), op.verified_at
			FROM registration r
			INNER JOIN users u ON u.id = r.user_id
			INNER JOIN gelombang g ON g.id = r.gelombang_id
			INNER JOIN gelombang_detail gd ON gd.gelombang_id = g.id
			LEFT JOIN registration_s1_detail rs1 ON rs1.registration_id = r.id
			LEFT JOIN registration_s2_detail rs2 ON rs2.registration_id = r.id
			LEFT JOIN program_studi ps ON ps.id = COALESCE(rs1.program_studi_id, rs2.program_studi_id)
			LEFT JOIN ospek_prerequisite op ON op.registration_id = r.id
			WHERE r.user_id = ?`

		args := []any{userID[:]}
		if regID != nil {
			query += " AND r.id = ?"
			args = append(args, (*regID)[:])
		}

		query += " ORDER BY r.created_at DESC LIMIT 1"

		err = db.QueryRowContext(r.Context(), query, args...).Scan(
			&op.RegistrationID, &op.FullName, &op.Email, &op.NIK,
			&op.BatchName, &degree, &op.AcademicYear,
			&studyProgram,
			&pasFotoName, &ijazahName, &op.Status, &notes, &uploadedAt, &verifiedAt,
		)

		if errors.Is(err, sql.ErrNoRows) {
			utils.WriteJSON(w, http.StatusNotFound, utils.ErrJSON(i18n.T("registration.not_found", lang)))
			return
		}
		if err != nil {
			slog.Error("get_ospek_prerequisite: query error", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}

		if studyProgram.Valid {
			op.StudyProgram = studyProgram.String
		} else {
			op.StudyProgram = "-"
		}

		op.UploadedAt = uploadedAt.Format("2006-01-02 15:04:05")
		if verifiedAt.Valid {
			v := verifiedAt.Time.Format("2006-01-02 15:04:05")
			op.VerifiedAt = &v
		}
		if notes.Valid {
			op.Notes = &notes.String
		}
		if pasFotoName.Valid {
			op.PasFotoName = &pasFotoName.String
		}
		if ijazahName.Valid {
			op.IjazahName = &ijazahName.String
		}

		op.NIK = decryptAndMask(op.NIK)

		utils.WriteJSON(w, http.StatusOK, op)
	}
}

func ServeOspekPrerequisite(db *sql.DB, docType string) http.HandlerFunc {
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
		var query string

		if docType == "pasphoto" {
			query = "SELECT pas_foto_path, pas_foto_name FROM ospek_prerequisite op INNER JOIN registration r ON r.id = op.registration_id WHERE r.id = ? AND r.user_id = ?"
		} else {
			query = "SELECT ijazah_path, ijazah_name FROM ospek_prerequisite op INNER JOIN registration r ON r.id = op.registration_id WHERE r.id = ? AND r.user_id = ?"
		}

		err = db.QueryRowContext(r.Context(), query, regID[:], userID[:]).Scan(&filePath, &fileName)

		if errors.Is(err, sql.ErrNoRows) || filePath == "" {
			utils.WriteJSON(w, http.StatusNotFound, utils.ErrJSON(i18n.T("registration.not_found", lang)))
			return
		}
		if err != nil {
			slog.Error("serve_ospek: query error", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}

		f, err := os.Open(filePath)
		if err != nil {
			slog.Error("serve_ospek: open file", "path", filePath, "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}
		defer f.Close()

		w.Header().Set("Content-Type", "application/pdf")
		w.Header().Set("Content-Disposition", "inline; filename=\""+fileName+"\"")
		w.Header().Set("Cache-Control", "private, no-cache, no-store, must-revalidate")

		if err := crypto.DecryptStream(f, w); err != nil {
			slog.Error("serve_ospek: decrypt error", "path", filePath, "error", err)
		}
	}
}

func UploadOspekPrerequisite(db *sql.DB, scanner *clamav.Client, storageDir string) http.HandlerFunc {
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

		const maxUploadSize = 5 << 20 // 5MB total
		if err := r.ParseMultipartForm(maxUploadSize); err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON(i18n.T("common.invalid_request", lang)))
			return
		}

		// Get registration ID from form
		regIDStr := r.FormValue("registrationID")
		if regIDStr == "" {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON(i18n.T("common.invalid_request", lang)))
			return
		}
		regID, err := uuid.Parse(regIDStr)
		if err != nil {
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
			slog.Error("upload_ospek: verify registration", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}

		targetPath := filepath.Join(storageDir, "ospek", userID.String(), regID.String())
		if err := os.MkdirAll(targetPath, 0755); err != nil {
			slog.Error("upload_ospek: mkdir error", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}

		processFile := func(formName string) (string, string, int64, error) {
			file, header, err := r.FormFile(formName)
			if err != nil {
				if errors.Is(err, http.ErrMissingFile) {
					return "", "", 0, nil
				}
				return "", "", 0, err
			}
			defer file.Close()

			encFilename := utils.GenerateUUIDString() + ".pdf.enc"
			cfg := utils.UploadConfig{
				TargetDir:  targetPath,
				TargetName: encFilename,
				MaxBytes:   2 << 20, // 2MB each
			}

			size, err := utils.SaveFile(r.Context(), file, header, cfg, scanner)
			if err != nil {
				return "", "", 0, err
			}

			return filepath.Join(targetPath, encFilename), header.Filename, size, nil
		}

		pasFotoPath, pasFotoOrigName, _, err := processFile("pasFoto")
		if err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON(err.Error()))
			return
		}

		ijazahPath, ijazahOrigName, _, err := processFile("ijazah")
		if err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON(err.Error()))
			return
		}

		if pasFotoPath == "" && ijazahPath == "" {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON(i18n.T("common.invalid_request", lang)))
			return
		}

		// INSERT or UPDATE
		// registration_id is PRIMARY KEY
		_, err = db.ExecContext(r.Context(), `
			INSERT INTO ospek_prerequisite (
				registration_id, pas_foto_path, pas_foto_name, ijazah_path, ijazah_name, status, uploaded_at
			) VALUES (?, ?, ?, ?, ?, 'PENDING', NOW())
			ON DUPLICATE KEY UPDATE
				pas_foto_path = COALESCE(NULLIF(?, ''), pas_foto_path),
				pas_foto_name = COALESCE(NULLIF(?, ''), pas_foto_name),
				ijazah_path = COALESCE(NULLIF(?, ''), ijazah_path),
				ijazah_name = COALESCE(NULLIF(?, ''), ijazah_name),
				status = 'PENDING',
				uploaded_at = NOW(),
				verified_at = NULL`,
			regID[:], pasFotoPath, pasFotoOrigName, ijazahPath, ijazahOrigName,
			pasFotoPath, pasFotoOrigName, ijazahPath, ijazahOrigName,
		)

		if err != nil {
			slog.Error("upload_ospek: insert/update db", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}

		utils.WriteJSON(w, http.StatusCreated, map[string]string{"message": "success"})
	}
}
