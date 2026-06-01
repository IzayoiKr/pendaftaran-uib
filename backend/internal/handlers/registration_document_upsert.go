package handlers

import (
	"database/sql"
	"errors"
	"log/slog"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"pendaftaran-uib/backend/internal/audit"
	"pendaftaran-uib/backend/internal/clamav"
	"pendaftaran-uib/backend/internal/models"
	"pendaftaran-uib/backend/internal/utils"
	"strings"

	"github.com/google/uuid"
)

const maxUploadSize = 2 << 20

type processedFileMeta struct {
	finalPath string
	sizeBytes int64
}

func processUploadedFiles(
	r *http.Request,
	targetDir string,
	scanner *clamav.Client,
	al *audit.Logger,
	base audit.Entry,
	userID string,
	formData *models.RegistrationForm,
) (map[string]processedFileMeta, *processedFileMeta, error) {
	processedFiles := make(map[string]processedFileMeta)
	var paymentProof *processedFileMeta

	var success bool
	defer func() {
		if !success {
			for _, meta := range processedFiles {
				_ = os.Remove(meta.finalPath)
			}
			if paymentProof != nil {
				_ = os.Remove(paymentProof.finalPath)
			}
		}
	}()

	for docType, headers := range r.MultipartForm.File {
		if len(headers) == 0 {
			continue
		}

		header := headers[0]
		if header.Size > maxUploadSize {
			return nil, nil, utils.ErrFileTooLarge
		}

		err := func() error {
			file, openErr := header.Open()
			if openErr != nil {
				return openErr
			}
			defer file.Close() 

			if docType == "paymentProof" {
				finalPath, size, err := runFilePipeline(r, file, header, targetDir, "payment_proof", scanner, al, base, userID)
				if err != nil { 
					return err 
				}
				paymentProof = &processedFileMeta{
					finalPath: finalPath,
					sizeBytes: size,
				}
				return nil
			}

			dt := models.DocType(docType)
			if !formData.IsValidDocumentField(dt) {
				slog.Warn("Upload rejected: invalid document form key", "key", docType, "user_id", userID)
				return errors.New("tipe dokumen '" + docType + "' tidak valid")
			}

			finalPath, size, pipeErr := runFilePipeline(r, file, header, targetDir, docType, scanner, al, base, userID)
			if pipeErr != nil {
				return pipeErr
			}

			processedFiles[docType] = processedFileMeta{
				finalPath: finalPath,
				sizeBytes: size,
			}
			return nil
		}()

		if err != nil {
			return nil, nil, err
		}
	}

	success = true
	return processedFiles, paymentProof, nil
}

func runFilePipeline(
	r *http.Request,
	file multipart.File,
	header *multipart.FileHeader,
	targetDir string,
	docType string,
	scanner *clamav.Client,
	al *audit.Logger,
	base audit.Entry,
	userID string,
) (string, int64, error) {
	encFilename, err := utils.FormatEncryptedPDFFileBuilder(docType)
	if err != nil {
		return "", 0, err
	}
	cfg := utils.UploadConfig{
		TargetDir:  targetDir,
		TargetName: encFilename,
		MaxBytes:   maxUploadSize,
	}

	size, err := utils.SaveFile(r.Context(), file, header, cfg, scanner)
	if err != nil {
		if errors.Is(err, utils.ErrMalwareDetected) {
			slog.Warn("SECURITY: malware detected within file payload", "user_id", userID, "doc_type", docType)
			al.Log(audit.Entry{
				Event:     audit.EventRegistrationUploadDocument,
				UserID:    userID,
				IP:        base.IP,
				UserAgent: base.UserAgent,
				RequestID: base.RequestID,
				Meta:      map[string]any{"doc_type": docType, "malware_action": "blocked"},
			})
			return "", 0, utils.ErrMalwareDetected
		}
		return "", 0, err
	}

	finalPath := filepath.Join(targetDir, encFilename)
	return finalPath, size, nil
}

func cleanOrphanDocs(
	r *http.Request,
	tx *sql.Tx,
	regID uuid.UUID,
	formData *models.RegistrationForm,
	newUploads map[string]processedFileMeta,
) ([]string, error) {
	rows, err := tx.QueryContext(r.Context(), `
		SELECT document_type, file_path
		FROM registration_document
		WHERE registration_id = ?`,
		regID[:],
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var orphanPaths []string
	var docTypesToDelete []string

	for rows.Next() {
		var docType, filePath string
		if err := rows.Scan(&docType, &filePath); err != nil {
			return nil, err
		}

		// If a new physical file is uploaded for this type, it replaces the old one
		if _, isReplaced := newUploads[docType]; isReplaced {
			orphanPaths = append(orphanPaths, filePath)
			continue
		}

		val, exists := formData.GetDocumentFieldValue(models.DocType(docType))
		if exists && len(strings.TrimSpace(val)) > 0 {
			continue
		}

		orphanPaths = append(orphanPaths, filePath)
		docTypesToDelete = append(docTypesToDelete, docType)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	if len(docTypesToDelete) > 0 {
		query := `DELETE FROM registration_document 
			WHERE registration_id = ? AND document_type IN (`
		args := make([]any, 1+len(docTypesToDelete))
		args[0] = regID[:]

		placeholders := make([]string, len(docTypesToDelete))
		for i, docType := range docTypesToDelete {
			placeholders[i] = "?"
			args[i+1] = docType
		}
		query += strings.Join(placeholders, ", ") + ")"

		if _, err := tx.ExecContext(r.Context(), query, args...); err != nil {
			return nil, err
		}
	}

	return orphanPaths, nil
}

func isNonEmptyString(s string) bool {
	return len(strings.TrimSpace(s)) > 0
}
