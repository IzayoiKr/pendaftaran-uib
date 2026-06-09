package handlers

import (
	"database/sql"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"pendaftaran-uib/backend/internal/audit"
	"pendaftaran-uib/backend/internal/auth"
	"pendaftaran-uib/backend/internal/clamav"
	"pendaftaran-uib/backend/internal/i18n"
	"pendaftaran-uib/backend/internal/models"
	"pendaftaran-uib/backend/internal/utils"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

const maxPayloadSize = 28 << 20
const memoryBufferSize = 256 << 10

func RegistrationDraft(db *sql.DB, storageDir string, scanner *clamav.Client, al *audit.Logger) http.HandlerFunc {
	return registrationUpsert(db, storageDir, scanner, al, false)
}

func RegistrationSubmit(db *sql.DB, storageDir string, scanner *clamav.Client, al *audit.Logger) http.HandlerFunc {
	return registrationUpsert(db, storageDir, scanner, al, true)
}

func registrationUpsert(db *sql.DB, storageDir string, scanner *clamav.Client, al *audit.Logger, isSubmit bool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		base := audit.EntryFromRequest(r)
		lang := utils.Lang(r)

		claims := auth.GetClaims(r)
		if claims == nil {
			utils.WriteJSON(w, http.StatusUnauthorized, utils.ErrJSON(i18n.T("common.unauthorized", lang)))
			return
		}

		batchKey := chi.URLParam(r, "batchKey")
		if batchKey == "" {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON(i18n.T("common.invalid_request", lang)))
			return
		}

		userID, err := uuid.Parse(claims.Subject)
		if err != nil {
			slog.Error("registration_upsert: parse uuid from claims", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}

		var (
			gelombangID uuid.UUID
			degree string
			batchType string
			existingRegID *uuid.UUID
			currentStatus *string
		)

		err = db.QueryRowContext(r.Context(), `
			SELECT
				g.id, g.degree, g.batch_type,
				r.id, r.status
			FROM gelombang g
			INNER JOIN gelombang_detail gd ON gd.gelombang_id = g.id
			LEFT JOIN registration r ON r.gelombang_id = g.id AND r.user_id = ?
			WHERE g.batch_key = ?
			  AND gd.registration_start <= CURRENT_DATE()
			  AND gd.registration_end >= CURRENT_DATE()`,
			userID[:], batchKey,
		).Scan(&gelombangID, &degree, &batchType, &existingRegID, &currentStatus)

		if errors.Is(err, sql.ErrNoRows) {
			utils.WriteJSON(w, http.StatusNotFound, utils.ErrJSON(i18n.T("registration.not_found", lang)))
			return
		}
		if err != nil {
			slog.Error("registration_upsert: fetch batch and registration status", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}
		if existingRegID != nil {
			if currentStatus != nil && (*currentStatus == "SUBMITTED" || *currentStatus == "VERIFIED") {
				utils.WriteJSON(w, http.StatusConflict, utils.ErrJSON(i18n.T("registration.already_submitted", lang)))
				return
			}
		}

		var regID uuid.UUID
		isNewRegistration := (existingRegID == nil)
		if isNewRegistration {
			regID = utils.NewUUID()
		} else {
			regID = *existingRegID
		}

		rc := http.NewResponseController(w)
		if err := rc.SetReadDeadline(time.Now().Add(2 * time.Minute)); err != nil {
			slog.Warn("Could not extend read deadline for multipart upload", "error", err)
		}
		if err := rc.SetWriteDeadline(time.Now().Add(2 * time.Minute)); err != nil {
			slog.Warn("Could not extend write deadline for multipart upload", "error", err)
		}

		r.Body = http.MaxBytesReader(w, r.Body, maxPayloadSize)
		if err := r.ParseMultipartForm(memoryBufferSize); err != nil {
			if strings.Contains(err.Error(), "request body too large") {
				utils.WriteJSON(w, http.StatusRequestEntityTooLarge, utils.ErrJSON(i18n.T("registration.file_too_large", lang, "{param}", "2MB")))
				return
			}
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON(i18n.T("common.invalid_request", lang)))
			return
		}
		defer func() {
			if err := r.MultipartForm.RemoveAll(); err != nil {
				slog.Error("registration_upsert: cleaner failed for multipart tmp files", "error", err)
			}
		}()

		formStr := r.FormValue("formData")
		if formStr == "" {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON(i18n.T("common.invalid_request", lang)))
			return
		}

		var form models.RegistrationForm
		dec := json.NewDecoder(strings.NewReader(formStr))
		dec.DisallowUnknownFields()
		if err := dec.Decode(&form); err != nil {
			slog.Debug("registration_upsert: json decoding mismatch", "error", err)
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON(i18n.T("common.invalid_request", lang)))
			return
		}

		form.Sanitize()

		newStatus := "DRAFT"
		if isSubmit {
			newStatus = "SUBMITTED"
			if err := validateFinalSubmission(r, &form, degree, batchType, lang); err != nil {
				utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON(err.Error()))
				return
			}
		}

		targetDir := filepath.Join(storageDir, "registrations", claims.Subject, regID.String())

		processedFiles, paymentProof, err := processUploadedFiles(r, targetDir, scanner, al, base, claims.Subject, &form, lang)
		if err != nil {
			if errors.Is(err, utils.ErrMalwareDetected) {
				slog.Warn("SECURITY: File upload blocked due to malware signature",
					"user_id", claims.Subject,
					"reg_id", regID,
					"error", err,
				)
				utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON(i18n.T("registration.upload_failed", lang)))
				return
			}
			if errors.Is(err, utils.ErrFileTooLarge) {
				utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON(i18n.T("registration.file_too_large", lang, "{param}", "2MB")))
				return
			}
			if errors.Is(err, utils.ErrInvalidType) {
				utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON(i18n.T("registration.invalid_file_type", lang)))
				return
			}
			slog.Error("registration_upsert: file extraction layer broken", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}

		committed := false
		var physicalFilesToDeleteLater []string
		defer func() {
			if !committed {
				for _, meta := range processedFiles {
					_ = os.Remove(meta.finalPath)
				}
				if paymentProof != nil {
					_ = os.Remove(paymentProof.finalPath)
				}
			} else {
				for _, path := range physicalFilesToDeleteLater {
					_ = os.Remove(path)
				}
			}
		}()

		tx, err := db.BeginTx(r.Context(), nil)
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}
		defer func() {
			if !committed {
				if rbErr := tx.Rollback(); rbErr != nil {
					slog.Error("registration_upsert: rollback", "error", rbErr)
				}
			}
		}()

		if isNewRegistration {
			if _, err := tx.ExecContext(r.Context(), `
				INSERT INTO registration (id, user_id, gelombang_id, status)
				VALUES (?, ?, ?, ?)`,
				regID[:], userID[:], gelombangID[:], newStatus,
			); err != nil {
				slog.Error("registration_upsert: insert new registration", "error", err)
				utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
				return
			}
		} else {
			if _, err := tx.ExecContext(r.Context(), `
				UPDATE registration SET status = ?, updated_at = NOW()
				WHERE id = ?`,
				newStatus, regID[:],
			); err != nil {
				slog.Error("registration_upsert: update registration status", "error", err)
				utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
				return
			}
		}

		if degree == "S1" {
			err = upsertS1Detail(r, tx, regID, &form)
		} else {
			err = upsertS2Detail(r, tx, regID, &form)
		}
		if err != nil {
			slog.Error("registration_upsert: detail hydration failed", "degree", degree, "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}

		var paymentFileName *string
		var paymentFileSize *int64
		var paymentFilePath string

		if paymentProof != nil {
			paymentFilePath = paymentProof.finalPath
			paymentFileSize = &paymentProof.sizeBytes
			if headers, exists := r.MultipartForm.File["paymentProof"]; exists && len(headers) > 0 {
				paymentFileName = &headers[0].Filename
			}
		}

		oldPaymentPath, err := upsertPayment(r, tx, regID, &form, paymentFilePath, paymentFileName, paymentFileSize)
		if err != nil {
			slog.Error("registration_upsert: upsert payment", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}

		orphanPaths, err := cleanOrphanDocs(r, tx, regID, &form, processedFiles)
		if err != nil {
			slog.Error("registration_upsert: orphan files cleanup", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}

		for docType, meta := range processedFiles {
			header := r.MultipartForm.File[docType]
			if len(header) == 0 {
				continue
			}
			filename := header[0].Filename

			if _, err := tx.ExecContext(r.Context(), `
				INSERT INTO registration_document (
					registration_id,
					document_type,
					file_path,
					file_name,
					file_size_bytes
				) VALUES (?, ?, ?, ?, ?) AS new_data
				ON DUPLICATE KEY UPDATE
					file_path       = new_data.file_path,
					file_name       = new_data.file_name,
					file_size_bytes = new_data.file_size_bytes,
					uploaded_at     = NOW()`,
				regID[:], docType, meta.finalPath, filename, meta.sizeBytes,
			); err != nil {
				slog.Error("registration_upsert: upsert document row", "doc_type", docType, "error", err)
				utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
				return
			}
		}

		if err := tx.Commit(); err != nil {
			slog.Error("registration_upsert: commit", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}
		committed = true
		physicalFilesToDeleteLater = append(physicalFilesToDeleteLater, orphanPaths...)
		if oldPaymentPath != "" {
			physicalFilesToDeleteLater = append(physicalFilesToDeleteLater, oldPaymentPath)
		}

		event := audit.EventRegistrationDraftSaved
		if isSubmit {
			event = audit.EventRegistrationSubmitSuccess
		}

		al.Log(audit.Entry{
			Event: event,
			UserID: claims.Subject,
			IP: base.IP,
			UserAgent: base.UserAgent,
			RequestID: base.RequestID,
			Meta: map[string]any{
				"batch_key": batchKey,
				"reg_id": regID.String(),
				"new_record": isNewRegistration,
			},
		})

		utils.WriteJSON(w, http.StatusOK, map[string]string{
			"message": i18n.T("common.saved", lang),
			"status": newStatus,
		})
	}
}

func validateFinalSubmission(r *http.Request, form *models.RegistrationForm, degree string, batchType string, lang string) error {
	if isBlank(form.Citizenship)   { return errors.New(i18n.T("registration.field_required", lang, "{field}", "Citizenship")) }
	if isBlank(form.BirthPlace)    { return errors.New(i18n.T("registration.field_required", lang, "{field}", "BirthPlace")) }
	if isBlank(form.BirthDate)     { return errors.New(i18n.T("registration.field_required", lang, "{field}", "BirthDate")) }
	if isBlank(form.MajorChoice)   { return errors.New(i18n.T("registration.field_required", lang, "{field}", "MajorChoice")) }
	if isBlank(form.AccountHolder) { return errors.New(i18n.T("registration.field_required", lang, "{field}", "AccountHolder")) }
	if !isDocProvided(form.PaymentProof, r, "paymentProof") {
		return errors.New(i18n.T("registration.doc_required", lang, "{field}", "PaymentProof"))
	}

	if !form.Pernyataan {
		return errors.New(i18n.T("registration.declaration_required", lang))
	}

	if degree == "S1" {
		if isBlank(form.Gender)         { return errors.New(i18n.T("registration.field_required", lang, "{field}", "Gender")) }
		if isBlank(form.PhoneNumber)    { return errors.New(i18n.T("registration.field_required", lang, "{field}", "PhoneNumber")) }
		if isBlank(form.WhatsappNumber) { return errors.New(i18n.T("registration.field_required", lang, "{field}", "WhatsappNumber")) }
		if isBlank(form.JenisDaftar)    { return errors.New(i18n.T("registration.field_required", lang, "{field}", "JenisDaftar")) }
		if isBlank(form.SchoolOrigin)   { return errors.New(i18n.T("registration.field_required", lang, "{field}", "SchoolOrigin")) }
		if isBlank(form.WaktuKuliah)    { return errors.New(i18n.T("registration.field_required", lang, "{field}", "WaktuKuliah")) }
		if isBlank(form.Bank)           { return errors.New(i18n.T("registration.field_required", lang, "{field}", "Bank")) }

		if !isDocProvided(form.Pp, r, "pp")   { return errors.New(i18n.T("registration.doc_required", lang, "{field}", "Pp")) }
		if !isDocProvided(form.Ktp, r, "ktp") { return errors.New(i18n.T("registration.doc_required", lang, "{field}", "Ktp")) }
		if !isDocProvided(form.Kk, r, "kk")   { return errors.New(i18n.T("registration.doc_required", lang, "{field}", "Kk")) }

		if form.JenisDaftar == "TRANSFER" || form.JenisDaftar == "ALIH_JENJANG" {
			if isBlank(form.PreviousUniversity) { return errors.New(i18n.T("registration.transfer_university_required", lang)) }
			if isBlank(form.PreviousMajor)      { return errors.New(i18n.T("registration.transfer_major_required", lang)) }
			if isBlank(form.Gpa)                { return errors.New(i18n.T("registration.transfer_gpa_required", lang)) }
			if isBlank(form.HighestEducation)   { return errors.New(i18n.T("registration.transfer_education_required", lang)) }
			if !isDocProvided(form.TranskripNilai, r, "transkripNilai") { return errors.New(i18n.T("registration.transfer_transcript_required", lang)) }
			if !isDocProvided(form.IjazahDok, r, "ijazahDok")           { return errors.New(i18n.T("registration.transfer_diploma_required", lang)) }
		}

		if form.JenisDaftar == "BARU" {
			if !form.Confirmation {
				return errors.New(i18n.T("registration.fresh_grad_required", lang))
			}
		}

		if batchType == "Beasiswa" {
			if isBlank(form.HighschoolGpa)          { return errors.New(i18n.T("registration.scholarship_gpa_required", lang)) }
			if isBlank(form.HighschoolGraduateYear) { return errors.New(i18n.T("registration.scholarship_year_required", lang)) }
		}
	}

	if degree == "S2" {
		if isBlank(form.ContactEmail) { return errors.New(i18n.T("registration.field_required", lang, "{field}", "ContactEmail")) }
		if isBlank(form.PhoneNumber)  { return errors.New(i18n.T("registration.field_required", lang, "{field}", "PhoneNumber")) }
		if isBlank(form.Religion)     { return errors.New(i18n.T("registration.field_required", lang, "{field}", "Religion")) }
		if isBlank(form.FundingSource){ return errors.New(i18n.T("registration.field_required", lang, "{field}", "FundingSource")) }
		if isBlank(form.Address)      { return errors.New(i18n.T("registration.field_required", lang, "{field}", "Address")) }
		if isBlank(form.SubDistrict)  { return errors.New(i18n.T("registration.field_required", lang, "{field}", "SubDistrict")) }
		if isBlank(form.District)     { return errors.New(i18n.T("registration.field_required", lang, "{field}", "District")) }

		if isBlank(form.PreviousMajor)      { return errors.New(i18n.T("registration.field_required", lang, "{field}", "PreviousMajor")) }
		if isBlank(form.Gpa)                { return errors.New(i18n.T("registration.field_required", lang, "{field}", "Gpa")) }
		if isBlank(form.Degree)             { return errors.New(i18n.T("registration.field_required", lang, "{field}", "Degree")) }
		if isBlank(form.PreviousUniversity) { return errors.New(i18n.T("registration.field_required", lang, "{field}", "PreviousUniversity")) }

		if isBlank(form.FatherName)  { return errors.New(i18n.T("registration.field_required", lang, "{field}", "FatherName")) }
		if isBlank(form.FatherPhone) { return errors.New(i18n.T("registration.field_required", lang, "{field}", "FatherPhone")) }
		if isBlank(form.MotherName)  { return errors.New(i18n.T("registration.field_required", lang, "{field}", "MotherName")) }
		if isBlank(form.MotherPhone) { return errors.New(i18n.T("registration.field_required", lang, "{field}", "MotherPhone")) }

		if !isDocProvided(form.Al, r, "al")   { return errors.New(i18n.T("registration.doc_required", lang, "{field}", "Al")) }
		if !isDocProvided(form.Kk, r, "kk")   { return errors.New(i18n.T("registration.doc_required", lang, "{field}", "Kk")) }
		if !isDocProvided(form.Pp, r, "pp")   { return errors.New(i18n.T("registration.doc_required", lang, "{field}", "Pp")) }
		if !isDocProvided(form.Ktp, r, "ktp") { return errors.New(i18n.T("registration.doc_required", lang, "{field}", "Ktp")) }
		if !isDocProvided(form.R1, r, "r1")   { return errors.New(i18n.T("registration.doc_required", lang, "{field}", "R1")) }
		if !isDocProvided(form.R2, r, "r2")   { return errors.New(i18n.T("registration.doc_required", lang, "{field}", "R2")) }
	}

	return nil
}

func isDocProvided(formValue string, r *http.Request, docKey string) bool {
	if !isBlank(formValue) {
		return true
	}
	if r.MultipartForm != nil && r.MultipartForm.File != nil {
		if headers, exists := r.MultipartForm.File[docKey]; exists && len(headers) > 0 {
			return true
		}
	}
	return false
}

func isBlank(s string) bool {
	return len(strings.TrimSpace(s)) == 0
}
