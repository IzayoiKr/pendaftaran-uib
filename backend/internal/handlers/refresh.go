package handlers

import (
	"database/sql"
	"errors"
	"net/http"
	"os"

	"pendaftaran-uib/backend/internal/auth"
	"pendaftaran-uib/backend/internal/models"
)

func Refresh(db *sql.DB, ts *auth.TokenStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("refresh_token")
		if err != nil {
			writeJSON(w, http.StatusUnauthorized, errJSON("no refresh token"))
			return
		}

		claims, err := auth.Validatetoken(cookie.Value)
		if err != nil {
			clearRefreshCookie(w)
			writeJSON(w, http.StatusUnauthorized, errJSON("invalid refresh token"))
			return
		}

		if claims.TokenType != auth.TokenTypeRefresh {
			clearRefreshCookie(w)
			writeJSON(w, http.StatusUnauthorized, errJSON("invalid token type"))
			return
		}

		revoked, err := ts.IsRevoked(r.Context(), claims.ID)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, errJSON("server error"))
			return
		}
		if revoked {
			clearRefreshCookie(w)
			writeJSON(w, http.StatusUnauthorized, errJSON("token has been revoked"))
			return
		}

		var user models.User
		err = db.QueryRowContext(r.Context(),
			`SELECT id, full_name, nik, email FROM users WHERE id = ?`,
			claims.UserID,
		).Scan(&user.ID, &user.FullName, &user.NIK, &user.Email)

		if errors.Is(err, sql.ErrNoRows) {
			clearRefreshCookie(w)
			writeJSON(w, http.StatusUnauthorized, errJSON("user not found"))
			return
		}
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, errJSON("server error"))
			return
		}

		newAccessToken, err := auth.GenerateAccessToken(user.ID, user.Email)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, errJSON("server error"))
			return
		}

		writeJSON(w, http.StatusOK, accessTokenResponse{
			AccessToken: newAccessToken,
			User:        user.ToDTO(),
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
		MaxAge: 12 * 60 * 60,
	})
}

func clearRefreshCookie(w http.ResponseWriter) {
	secure := os.Getenv("APP_ENV") == "production"
	http.SetCookie(w, &http.Cookie{
		Name:     "refresh_token",
		Value:    "",
		Path:     "/api/auth",
		HttpOnly: true,
		Secure: secure,
		SameSite: http.SameSiteStrictMode,
		MaxAge:   -1,
	})
}

func setAuthHintCookie(w http.ResponseWriter) {
    secure := os.Getenv("APP_ENV") == "production"
    http.SetCookie(w, &http.Cookie{
        Name:     "auth_hint",
        Value:    "1",
        Path:     "/",
        HttpOnly: true,
        Secure:   secure,
        SameSite: http.SameSiteStrictMode,
        MaxAge:   12 * 60 * 60,
    })
}

func clearAuthHintCookie(w http.ResponseWriter) {
    secure := os.Getenv("APP_ENV") == "production"
    http.SetCookie(w, &http.Cookie{
        Name:     "auth_hint",
        Value:    "",
        Path:     "/",
        HttpOnly: true,
        Secure:   secure,
        SameSite: http.SameSiteStrictMode,
        MaxAge:   -1,
    })
}
