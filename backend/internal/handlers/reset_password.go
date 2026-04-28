package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"time"

	"golang.org/x/crypto/bcrypt"
	"pendaftaran-uib/backend/internal/models"
)

func ResetPassword(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req models.ResetPasswordRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, `{"error":"Format data tidak valid"}`, http.StatusBadRequest)
			return
		}

		var userID string
		currentTime := time.Now().Format("2006-01-02 15:04:05")
		
		err := db.QueryRow("SELECT id FROM users WHERE reset_token = ? AND reset_token_expiry > ?", req.Token, currentTime).Scan(&userID)
		if err != nil {
			http.Error(w, `{"error":"Token tidak valid atau sudah kedaluwarsa"}`, http.StatusBadRequest)
			return
		}

		newHash, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
		if err != nil {
			http.Error(w, `{"error":"Terjadi kesalahan saat memproses password baru"}`, http.StatusInternalServerError)
			return
		}

		_, err = db.Exec("UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?", string(newHash), userID)
		if err != nil {
			http.Error(w, `{"error":"Gagal mereset password"}`, http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"message":"Password berhasil direset"}`))
	}
}
