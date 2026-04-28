package handlers

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"

	"golang.org/x/crypto/bcrypt"
	"pendaftaran-uib/backend/internal/models"
)

func ForgotPassword(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req models.ForgotPasswordRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, `{"error":"Invalid input"}`, http.StatusBadRequest)
			return
		}

		log.Printf("DEBUG: Mencari Email: '%s' dengan NIK: '%s'", req.Email, req.NIK)

		var userID string
		query := "SELECT id FROM users WHERE email = ? AND nik = ?"
		err := db.QueryRow(query, req.Email, req.NIK).Scan(&userID)

		if err != nil {
			log.Printf("DEBUG: User tidak ditemukan di database: %v", err)
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusNotFound)
			w.Write([]byte(`{"error":"Email atau NIK tidak ditemukan"}`))
			return
		}

		newPassword := "passwordreset"
		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)

		_, err = db.Exec("UPDATE users SET password_hash = ? WHERE id = ?", string(hashedPassword), userID)
		if err != nil {
			http.Error(w, `{"error":"Gagal update database"}`, http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"message":"Password berhasil direset"}`))
	}
}
