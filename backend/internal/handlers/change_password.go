package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"golang.org/x/crypto/bcrypt"
	"pendaftaran-uib/backend/internal/auth"
	"pendaftaran-uib/backend/internal/models"
)

func ChangePassword(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		claims := auth.GetClaims(r)
		if claims == nil {
			http.Error(w, `{"error":"Unauthorized"}`, http.StatusUnauthorized)
			return
		}

		var req models.ChangePasswordRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, `{"error":"Invalid input"}`, http.StatusBadRequest)
			return
		}

		var currentHash string
		err := db.QueryRow("SELECT password_hash FROM users WHERE id = ?", claims.UserID).Scan(&currentHash)
		if err != nil {
			http.Error(w, `{"error":"User not found"}`, http.StatusNotFound)
			return
		}

		if err := bcrypt.CompareHashAndPassword([]byte(currentHash), []byte(req.OldPassword)); err != nil {
			http.Error(w, `{"error":"Incorrect old password"}`, http.StatusUnauthorized)
			return
		}

		newHash, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
		if err != nil {
			http.Error(w, `{"error":"Error securing password"}`, http.StatusInternalServerError)
			return
		}

		_, err = db.Exec("UPDATE users SET password_hash = ? WHERE id = ?", string(newHash), claims.UserID)
		if err != nil {
			http.Error(w, `{"error":"Failed to update password"}`, http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"message":"Password updated successfully"}`))
	}
}

