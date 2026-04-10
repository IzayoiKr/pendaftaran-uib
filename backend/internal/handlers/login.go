package handlers

import (
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"
	"os"

	"pendaftaran-uib/backend/internal/auth"
	"pendaftaran-uib/backend/internal/models"

	"golang.org/x/crypto/bcrypt"
)

type loginRequest struct {
	Email string `json:"email"`
	Password string `json:"password"`
}

type accessTokenResponse struct {
	AccessToken string `json:"token"`
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

		writeJSON(w, http.StatusOK, accessTokenResponse{
			AccessToken: accessToken,
			User: user.ToDTO(),
		})
	}
}

func setRefreshCookie(w http.ResponseWriter, refreshToken string) {
	secure := os.Getenv("APP_ENV") == "production"
	http.SetCookie(w, &http.Cookie{
		Name: "refresh_token",
		Value: refreshToken,
		Path: "/api/auth",
		HttpOnly: true,
		Secure: secure,
		SameSite: http.SameSiteStrictMode,
		MaxAge: 24 * 60 * 60,
	})
}
