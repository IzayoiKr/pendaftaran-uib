package handlers

import (
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"

	"pendaftaran-uib/backend/internal/auth"
	"pendaftaran-uib/backend/internal/models"

	"golang.org/x/crypto/bcrypt"
)

type loginRequest struct {
	Email string `json:"email"`
	Password string `json:"password"`
}

type accessTokenResponse struct {
	AccessToken string `json:"access_token"`
	User models.UserDTO `json:"user"`
}

func Login(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req loginRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			writeJSON(w, http.StatusBadRequest, errJSON("permintaan tidak valid"))
			return
		}
		if req.Email == "" || req.Password == "" {
			writeJSON(w, http.StatusBadRequest, errJSON("email dan password wajib diisi"))
			return
		}

		var user models.User
		err := db.QueryRowContext(r.Context(),
			`SELECT id, full_name, nik, email, password_hash
			 FROM users WHERE email = ?`,
			req.Email,
		).Scan(&user.ID, &user.FullName, &user.NIK, &user.Email, &user.PasswordHash)

		if errors.Is(err, sql.ErrNoRows) {
			w.Header().Set("X-Auth-Error", "credentials")
			writeJSON(w, http.StatusUnauthorized, errJSON("email atau password salah"))
			return
		}
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, errJSON("server error"))
			return
		}

		if err := bcrypt.CompareHashAndPassword(
			[]byte(user.PasswordHash), []byte(req.Password),
		); err != nil {
			w.Header().Set("X-Auth-Error", "credentials")
			writeJSON(w, http.StatusUnauthorized, errJSON("email atau password salah"))
			return
		}

		accessToken, err := auth.GenerateAccessToken(user.ID, user.Email)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, errJSON("server error"))
			return
		}

		refreshToken, err := auth.GenerateRefreshToken(user.ID, user.Email)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, errJSON("server error"))
		}

		setRefreshCookie(w, refreshToken)
		setAuthHintCookie(w)

		writeJSON(w, http.StatusOK, accessTokenResponse{
			AccessToken: accessToken,
			User: user.ToDTO(),
		})
	}
}
