package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strings"

	"golang.org/x/crypto/bcrypt"
)

type registerRequest struct {
	Email    string `json:"email"`
	Username string `json:"username"`
	Password string `json:"password"`
}

func RegisterHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req registerRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, `{"error":"invalid request body"}`, http.StatusBadRequest)
			return
		}

		req.Email = strings.TrimSpace(req.Email)
		req.Username = strings.TrimSpace(req.Username)

		if req.Email == "" || req.Username == "" || req.Password == "" {
			http.Error(w, `{"error":"email, username, and password are required"}`, http.StatusBadRequest)
			return
		}
		if len(req.Password) < 8 {
			http.Error(w, `{"error":"password must be at least 8 characters"}`, http.StatusBadRequest)
			return
		}

		hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			http.Error(w, `{"error":"internal server error"}`, http.StatusInternalServerError)
			return
		}

		_, err = db.ExecContext(r.Context(),
			"INSERT INTO users (email, username, password_hash) VALUES (?, ?, ?)",
			req.Email, req.Username, string(hash),
		)
		if err != nil {
			// MySQL error 1062 = duplicate entry
			if strings.Contains(err.Error(), "1062") || strings.Contains(err.Error(), "Duplicate entry") {
				http.Error(w, `{"error":"email is already registered"}`, http.StatusConflict)
				return
			}
			http.Error(w, `{"error":"internal server error"}`, http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]string{"message": "registration successful"})
	}
}
