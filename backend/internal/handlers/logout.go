package handlers

import (
	"log/slog"
	"net/http"

	"pendaftaran-uib/backend/internal/auth"
	"pendaftaran-uib/backend/internal/utils"
)

func Logout(ts *auth.TokenStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if claims := auth.GetClaims(r); claims != nil {
			if err := ts.Revoke(r.Context(), claims); err != nil {
				slog.Error("logout: revoke access token", "jti", claims.ID, "error", err)
			}
		}

		if cookie, err := r.Cookie("refresh_token"); err == nil {
			if refreshClaims, err := auth.ValidateToken(cookie.Value); err == nil {
				if err := ts.Revoke(r.Context(), refreshClaims); err != nil {
					slog.Error("logout: revoke refresh token", "jti", refreshClaims.ID, "error", err)
				}
				if err := ts.RevokeSession(r.Context(), refreshClaims.SessionID); err != nil {
					slog.Error("logout: RevokeSession", "session_id", refreshClaims.SessionID, "error", err)
				}
			}
		}

		clearRefreshCookie(w)

		utils.WriteJSON(w, http.StatusOK, map[string]string{
			"message": "logout berhasil",
		})
	}
}
