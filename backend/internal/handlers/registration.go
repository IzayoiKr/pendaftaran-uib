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
	"pendaftaran-uib/backend/internal/models"
	"pendaftaran-uib/backend/internal/utils"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

const maxPayloadSize = 30 << 20
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

		claims := auth.GetClaims(r)
		if claims == nil {
			utils.WriteJSON(w, http.StatusUnauthorized, utils.ErrJSON("unauthorized"))
			return
		}

		batchKey := chi.URLParam(r, "batchKey")
		if batchKey == "" {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON("permintaan tidak valid"))
			return
		}

		userID, err := uuid.Parse(claims.UserID)
		if err != nil {
			slog.Error("registration_upsert: parse uuid from claims", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
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
			utils.WriteJSON(w, http.StatusNotFound, utils.ErrJSON("pendaftaran tidak ditemukan atau sudah ditutup"))
			return
		}
		if err != nil {
			slog.Error("registration_upsert: fetch batch and registration status", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}
		if existingRegID != nil {
			if currentStatus != nil && (*currentStatus == "SUBMITTED" || *currentStatus == "VERIFIED") {
				utils.WriteJSON(w, http.StatusConflict, utils.ErrJSON("pendaftaran sudah dikirimkan dan tidak dapat diubah"))
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
				utils.WriteJSON(w, http.StatusRequestEntityTooLarge, utils.ErrJSON("ukuran data terlalu besar"))
				return
			}
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON("gagal memproses data form"))
			return
		}
		defer func() {
			if err := r.MultipartForm.RemoveAll(); err != nil {
				slog.Error("registration_upsert: cleaner failed for multipart tmp files", "error", err)
			}
		}()

		formStr := r.FormValue("formData")
		if formStr == "" {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON("data form tidak ditemukan"))
			return
		}

		var form models.RegistrationForm
		dec := json.NewDecoder(strings.NewReader(formStr))
		dec.DisallowUnknownFields()
		if err := dec.Decode(&form); err != nil {
			slog.Debug("registration_upsert: json decoding mismatch", "error", err)
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON("data form tidak valid"))
			return
		}

		form.Sanitize()

		newStatus := "DRAFT"
		if isSubmit {
			newStatus = "SUBMITTED"
			if err := validateFinalSubmission(&form, degree, batchType); err != nil {
				utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON(err.Error()))
				return
			}
		} 

		targetDir := filepath.Join(storageDir, "registrations", claims.UserID, regID.String())

		processedFiles, paymentProof, err := processUploadedFiles(r, targetDir, scanner, al, base, claims.UserID, &form)
		if err != nil {
			if errors.Is(err, utils.ErrMalwareDetected) {
				slog.Warn("SECURITY: File upload blocked due to malware signature", 
					"user_id", claims.UserID, 
					"reg_id", regID,
					"error", err,
				)
				utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON("dokumen gagal diupload"))
				return
			}
			if errors.Is(err, utils.ErrFileTooLarge) {
				utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON(err.Error()))
				return
			}
			if errors.Is(err, utils.ErrInvalidType) {
				utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON(err.Error()))
				return
			}
			slog.Error("registration_upsert: file extraction layer broken", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
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
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
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
				utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
				return
			}
		} else {
			if _, err := tx.ExecContext(r.Context(), `
				UPDATE registration SET status = ?, updated_at = NOW()
				WHERE id = ?`,
				newStatus, regID[:],
			); err != nil {
				slog.Error("registration_upsert: update registration status", "error", err)
				utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
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
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
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
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}

		orphanPaths, err := cleanOrphanDocs(r, tx, regID, &form, processedFiles)
		if err != nil {
			slog.Error("registration_upsert: orphan files cleanup", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
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
				utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
				return
			}
		}

		if err := tx.Commit(); err != nil {
			slog.Error("registration_upsert: commit", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
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
			UserID: claims.UserID,
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
			"message": "berhasil disimpan",
			"status": newStatus,
		})
	}
}

func validateFinalSubmission(form *models.RegistrationForm, degree string, batchType string) error {
	if isBlank(form.Citizenship)   { return errors.New("kewarganegaraan wajib diisi") }
	if isBlank(form.BirthPlace)    { return errors.New("tempat lahir wajib diisi") }
	if isBlank(form.BirthDate)     { return errors.New("tanggal lahir wajib diisi") }
	if isBlank(form.MajorChoice)   { return errors.New("pilihan program studi wajib diisi") }
	if isBlank(form.AccountHolder) { return errors.New("nama pemilik rekening wajib diisi") }
	if isBlank(form.PaymentProof)  { return errors.New("dokumen bukti pembayaran wajib diunggah") }
	
	if form.Pernyataan == nil || !*form.Pernyataan {
		return errors.New("pernyataan keabsahan data pendaftaran wajib dicentang")
	}

	if degree == "S1" {
		if isBlank(form.Gender)         { return errors.New("jenis kelamin wajib diisi") }
		if isBlank(form.PhoneNumber)    { return errors.New("nomor hp wajib diisi") }
		if isBlank(form.WhatsappNumber) { return errors.New("nomor whatsapp wajib diisi") }
		if isBlank(form.JenisDaftar)    { return errors.New("jenis pendaftaran wajib diisi") }
		if isBlank(form.SchoolOrigin)   { return errors.New("asal sekolah wajib diisi") }
		if isBlank(form.WaktuKuliah)    { return errors.New("waktu kuliah wajib diisi") }
		if isBlank(form.Bank)           { return errors.New("nama bank wajib diisi") }

		if isBlank(form.Pp)  { return errors.New("pasfoto wajib diunggah") }
		if isBlank(form.Ktp) { return errors.New("ktp / sim / passport wajib diunggah") }
		if isBlank(form.Kk)  { return errors.New("kartu keluarga wajib diunggah") }

		jenisDaftar := *form.JenisDaftar

		if jenisDaftar == "TRANSFER" || jenisDaftar == "ALIH_JENJANG" {
			if isBlank(form.PreviousUniversity) { return errors.New("universitas asal wajib diisi untuk jalur transfer/alih jenjang") }
			if isBlank(form.PreviousMajor)      { return errors.New("program studi asal wajib diisi untuk jalur transfer/alih jenjang") }
			if isBlank(form.Gpa)                { return errors.New("ipk wajib diisi untuk jalur transfer/alih jenjang") }
			if isBlank(form.HighestEducation)   { return errors.New("jenjang pendidikan terakhir wajib diisi untuk jalur transfer/alih jenjang") }
			if isBlank(form.TranskripNilai)     { return errors.New("dokumen transkrip nilai wajib diunggah untuk jalur transfer/alih jenjang") }
			if isBlank(form.IjazahDok)          { return errors.New("dokumen ijazah wajib diunggah untuk jalur transfer/alih jenjang") }
		}

		if jenisDaftar == "BARU" {
			if form.Confirmation == nil || !*form.Confirmation {
				return errors.New("konfirmasi belum pernah kuliah wajib dicentang")
			}
		}

		if batchType == "Beasiswa" {
			if isBlank(form.HighschoolGpa)          { return errors.New("nilai rata-rata rapor sma wajib diisi untuk pendaftaran beasiswa") }
			if isBlank(form.HighschoolGraduateYear) { return errors.New("tahun lulus sma wajib diisi untuk pendaftaran beasiswa") }
		}
	}

	if degree == "S2" {
		if isBlank(form.ContactEmail) { return errors.New("email kontak wajib diisi") }
		if isBlank(form.PhoneNumber)  { return errors.New("nomor telepon wajib diisi") }
		if isBlank(form.Religion)     { return errors.New("agama wajib diisi") }
		if isBlank(form.FundingSource){ return errors.New("sumber biaya wajib diisi") }
		if isBlank(form.Address)      { return errors.New("alamat tempat tinggal wajib diisi") }
		if isBlank(form.SubDistrict)  { return errors.New("kecamatan wajib diisi") }
		if isBlank(form.District)     { return errors.New("kelurahan wajib diisi") }

		if isBlank(form.PreviousMajor)      { return errors.New("jurusan asal s1 wajib diisi") }
		if isBlank(form.Gpa)                { return errors.New("ipk s1 wajib diisi") }
		if isBlank(form.Degree)             { return errors.New("gelar sarjana s1 wajib diisi") }
		if isBlank(form.PreviousUniversity) { return errors.New("nama universitas asal s1 wajib diisi") }

		if isBlank(form.FatherName)  { return errors.New("nama ayah wajib diisi") }
		if isBlank(form.FatherPhone) { return errors.New("nomor telepon ayah wajib diisi") }
		if isBlank(form.MotherName)  { return errors.New("nama ibu wajib diisi") }
		if isBlank(form.MotherPhone) { return errors.New("nomor telepon ibu wajib diisi") }

		if isBlank(form.Al)  { return errors.New("dokumen akta lahir wajib diunggah") }
		if isBlank(form.Kk)  { return errors.New("kartu keluarga wajib diunggah") }
		if isBlank(form.Pp)  { return errors.New("pasfoto wajib diunggah") }
		if isBlank(form.Ktp) { return errors.New("ktp wajib diunggah") }
		if isBlank(form.R1)  { return errors.New("dokumen ijazah sarjana wajib diunggah") }
		if isBlank(form.R2)  { return errors.New("dokumen transkrip nilai sarjana wajib diunggah") }
	}

	return nil
}

func isBlank(ptr *string) bool {
    return ptr == nil || len(strings.TrimSpace(*ptr)) == 0
}
