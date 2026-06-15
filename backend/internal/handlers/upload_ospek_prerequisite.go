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

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

func GetOspekPrerequisites(db *sql.DB) http.HandlerFunc {
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

		// Load registration details (RegistrationCardDTO)
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

		if err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				utils.WriteJSON(w, http.StatusNotFound, utils.ErrJSON(i18n.T("registration.not_found", lang)))
				return
			}
			slog.Error("get_ospek_prerequisites: lookup registration failed", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}

		// Load OSPEK prerequisite
		var ospek models.OspekPrerequisite
		ospek.RegistrationID = regID.String()

		err = db.QueryRowContext(r.Context(), `
			SELECT pas_foto_path, pas_foto_name, ijazah_path, ijazah_name, status, notes, uploaded_at
			FROM ospek_prerequisite
			WHERE registration_id = ?`,
			regID[:],
		).Scan(
			&ospek.PasFotoPath, &ospek.PasFotoName, &ospek.IjazahPath, &ospek.IjazahName,
			&ospek.Status, &ospek.Notes, &ospek.UploadedAt,
		)

		if err != nil && !errors.Is(err, sql.ErrNoRows) {
			slog.Error("get_ospek_prerequisites: query ospek error", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}

		prodiTitle := "-"
		if currentProdiCode.Valid {
			prodiTitle = i18n.T("program."+currentProdiCode.String+".title", lang)
		}

		utils.WriteJSON(w, http.StatusOK, map[string]any{
			"registration": card,
			"ospek":        ospek,
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

func UploadOspekPrerequisite(db *sql.DB, storageDir string, scanner *clamav.Client, al *audit.Logger) http.HandlerFunc {
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

		if err := r.ParseMultipartForm(maxUploadSize * 2); err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON(i18n.T("common.invalid_request", lang)))
			return
		}

		targetDir := filepath.Join(storageDir, "registrations", userID.String(), regID.String(), "ospek")
		
		processedFiles := make(map[string]struct {
			path string
			name string
		})

		defer func() {
			if err != nil {
				for _, f := range processedFiles {
					_ = os.Remove(f.path)
				}
			}
		}()

		fields := []string{"pasFoto", "ijazah"}
		for _, field := range fields {
			file, header, fileErr := r.FormFile(field)
			if fileErr != nil {
				if errors.Is(fileErr, http.ErrMissingFile) {
					continue
				}
				err = fileErr
				utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON(i18n.T("common.invalid_request", lang)))
				return
			}
			defer file.Close()

			encFilename, buildErr := utils.FormatEncryptedPDFFileBuilder("ospek_" + field)
			if buildErr != nil {
				err = buildErr
				utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
				return
			}

			cfg := utils.UploadConfig{
				TargetDir:  targetDir,
				TargetName: encFilename,
				MaxBytes:   maxUploadSize,
			}

			_, saveErr := utils.SaveFile(r.Context(), file, header, cfg, scanner)
			if saveErr != nil {
				err = saveErr
				if errors.Is(saveErr, utils.ErrMalwareDetected) {
					utils.WriteJSON(w, http.StatusUnprocessableEntity, utils.ErrJSON(i18n.T("common.malware_detected", lang)))
					return
				}
				if errors.Is(saveErr, utils.ErrInvalidType) {
					utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON(i18n.T("common.invalid_file_type", lang)))
					return
				}
				utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
				return
			}

			processedFiles[field] = struct {
				path string
				name string
			}{
				path: filepath.Join("registrations", userID.String(), regID.String(), "ospek", encFilename),
				name: header.Filename,
			}
		}

		if len(processedFiles) == 0 {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON(i18n.T("registration.file_required", lang)))
			return
		}

		// UPSERT Ospek record
		query := `
			INSERT INTO ospek_prerequisite (
				registration_id, pas_foto_path, pas_foto_name, ijazah_path, ijazah_name, status
			) VALUES (?, ?, ?, ?, ?, 'PENDING')
			ON DUPLICATE KEY UPDATE
				pas_foto_path = COALESCE(VALUES(pas_foto_path), pas_foto_path),
				pas_foto_name = COALESCE(VALUES(pas_foto_name), pas_foto_name),
				ijazah_path = COALESCE(VALUES(ijazah_path), ijazah_path),
				ijazah_name = COALESCE(VALUES(ijazah_name), ijazah_name),
				status = 'PENDING',
				uploaded_at = CURRENT_TIMESTAMP`

		var pf, pfn, ij, ijn *string
		if f, ok := processedFiles["pasFoto"]; ok {
			pf = &f.path
			pfn = &f.name
		}
		if f, ok := processedFiles["ijazah"]; ok {
			ij = &f.path
			ijn = &f.name
		}

		_, err = db.ExecContext(r.Context(), query, regID[:], pf, pfn, ij, ijn)
		if err != nil {
			slog.Error("upload_ospek_prerequisite: db error", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}

		al.Log(audit.Entry{
			Event:     audit.EventRegistrationUploadDocument,
			UserID:    userID.String(),
			IP:        utils.RealIP(r),
			UserAgent: r.UserAgent(),
			RequestID: chi.URLParam(r, "requestId"),
			Meta:      map[string]any{"registration_id": regID.String(), "type": "ospek_prerequisite"},
		})

		utils.WriteJSON(w, http.StatusOK, map[string]string{"message": i18n.T("registration.upload_success", lang)})
	}
}
