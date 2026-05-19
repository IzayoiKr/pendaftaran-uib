package handlers

import (
	"database/sql"
	"fmt"
	"log/slog"
	"net/http"
	"path/filepath"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"pendaftaran-uib/backend/internal/auth"
	"pendaftaran-uib/backend/internal/utils"
)

func UploadTransferProof(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		claims := auth.GetClaims(r)
		if claims == nil {
			utils.WriteJSON(w, http.StatusUnauthorized, utils.ErrJSON("unauthorized"))
			return
		}

		regID := chi.URLParam(r, "id")
		if regID == "" {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON("missing registration id"))
			return
		}

		idBytes, err := utils.UUIDToBytes(claims.UserID)
		if err != nil {
			slog.Error("transfer: parse uuid to bytes", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}

		resolvedID, isS2, err := ResolveRegistrationID(r.Context(), db, regID, idBytes)
		if err != nil {
			utils.WriteJSON(w, http.StatusNotFound, utils.ErrJSON("registration not found"))
			return
		}

		if err := r.ParseMultipartForm(10 << 20); err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON("Failed to parse form data"))
			return
		}

		pemilikRek := r.FormValue("pemilikRekening")
		bank := r.FormValue("bank")

		file, header, err := r.FormFile("file")
		if err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON("Bukti transfer wajib diunggah (Proof of payment is required)"))
			return
		}
		defer file.Close()

		// Validate file size and type
		if header.Size > 2<<20 {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON("File exceeds 2MB limit."))
			return
		}
		ext := strings.ToLower(filepath.Ext(header.Filename))
		if ext != ".pdf" && ext != ".jpg" && ext != ".jpeg" && ext != ".png" {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON("File must be a PDF or Image (JPG, PNG)."))
			return
		}

		var tableName string
		if !isS2 {
			tableName = "s1_registrations"
		} else {
			tableName = "s2_registrations"
		}

		// Get user info for folder name
		var nama, nik, regKey string
		var createdAt time.Time
		err = db.QueryRowContext(r.Context(), fmt.Sprintf("SELECT nama, nik, registration_key, created_at FROM %s WHERE id = ? AND user_id = ?", tableName), resolvedID, idBytes).Scan(&nama, &nik, &regKey, &createdAt)
		if err != nil {
			slog.Error("Failed to get registration info", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("Failed to process upload"))
			return
		}

		formattedID, err := GetRegistrationID(r.Context(), db, resolvedID, regKey, createdAt, isS2)
		if err != nil {
			slog.Error("Failed to compute formatted ID", "error", err)
			formattedID = nik // Fallback
		}

		folderPath := filepath.Join("uploads", "registrations", formattedID, "bukti transfer")

		path, err := utils.SaveUploadedFile(file, header, folderPath)
		if err != nil {
			slog.Error("Failed to save transfer proof", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("Failed to save file"))
			return
		}

		// Update database: Insert into registration_payments
		paymentID := utils.GenerateUUIDBytes()
		query := `
			INSERT INTO registration_payments (
				id, registration_id, registration_type,
				pemilik_rekening, bank, bukti_bayar_path, status
			) VALUES (?, ?, ?, ?, ?, ?, 'Masih dalam pemeriksaan')`

		_, err = db.ExecContext(r.Context(), query, paymentID, resolvedID, strings.ToUpper(tableName[:2]), pemilikRek, bank, path)
		if err != nil {
			slog.Error("Failed to insert registration payment", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("Failed to save payment record"))
			return
		}

		utils.WriteJSON(w, http.StatusOK, map[string]string{"message": "Bukti transfer berhasil diunggah (Proof of payment uploaded successfully)"})
	}
}
