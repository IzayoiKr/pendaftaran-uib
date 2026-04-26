package handlers

import (
	"database/sql"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"time"

	"pendaftaran-uib/backend/internal/auth"
	"pendaftaran-uib/backend/internal/models"
	"pendaftaran-uib/backend/internal/utils"

	"github.com/google/uuid"
)

func Refresh(db *sql.DB, ts *auth.TokenStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("refresh_token")
		if err != nil {
			utils.WriteJSON(w, http.StatusUnauthorized, utils.ErrJSON("no refresh token"))
			return
		}

		claims, err := auth.ValidateToken(cookie.Value)
		if err != nil {
			clearRefreshCookie(w)
			utils.WriteJSON(w, http.StatusUnauthorized, utils.ErrJSON("invalid refresh token"))
			return
		}

		if claims.TokenType != auth.TokenTypeRefresh {
			clearRefreshCookie(w)
			utils.WriteJSON(w, http.StatusUnauthorized, utils.ErrJSON("invalid token type"))
			return
		}

		sessionID := claims.SessionID
		if sessionID == "" {
			clearRefreshCookie(w)
			utils.WriteJSON(w, http.StatusUnauthorized, utils.ErrJSON("invalid token"))
			return
		}

		sessionValid, err := ts.IsSessionValid(r.Context(), sessionID)
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}
		if !sessionValid {
			clearRefreshCookie(w)
			slog.Error("SECURITY: refresh attempt on invalid/revoked session",
				"session_id", sessionID,
				"user_id", claims.UserID)
			utils.WriteJSON(w, http.StatusUnauthorized, utils.ErrJSON("sesi tidak valid, silahkan login kembali"))
			return
		}

		revoked, err := ts.IsRevoked(r.Context(), claims.ID)
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}
		if revoked {
			if err := ts.RevokeSession(r.Context(), sessionID); err != nil {
				slog.Error("refresh: RevokeSession after revokedJTI",
					"session_id", sessionID,
					"error", err)
			}
			clearRefreshCookie(w)
			utils.WriteJSON(w, http.StatusUnauthorized, utils.ErrJSON("token has been revoked"))
			return
		}

		var user models.User
		err = db.QueryRowContext(r.Context(),
			`SELECT id, full_name, nik, email FROM users WHERE id = ?`,
			claims.UserID,
		).Scan(&user.ID, &user.FullName, &user.NIK, &user.Email)

		if errors.Is(err, sql.ErrNoRows) {
			clearRefreshCookie(w)
			utils.WriteJSON(w, http.StatusUnauthorized, utils.ErrJSON("user tidak ditemukan"))
			return
		}
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}

		newSessionID := uuid.NewString()

		if err := ts.StoreSession(r.Context(), newSessionID, user.ID, time.Now().Add(auth.RefreshTokenTTL)); err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}

		newAccessToken, err := auth.GenerateAccessToken(user.ID, user.Email, newSessionID)
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}

		newRefreshToken, err := auth.GenerateRefreshToken(user.ID, user.Email, newSessionID)
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}

		if err := ts.RevokeSession(r.Context(), sessionID); err != nil {
			slog.Error("refresh: RevokeSession old session",
				"session_id", sessionID,
				"error", err)
		}

		if err := ts.Revoke(r.Context(), claims); err != nil {
			slog.Error("refresh: blacklist old refresh JTI",
				"jti", claims.ID,
				"error", err)
		}

		setRefreshCookie(w, newRefreshToken)

		utils.WriteJSON(w, http.StatusOK, accessTokenResponse{
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
