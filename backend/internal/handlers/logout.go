package handlers

import (
	"log/slog"
	"net/http"

	"pendaftaran-uib/backend/internal/audit"
	"pendaftaran-uib/backend/internal/auth"
	"pendaftaran-uib/backend/internal/i18n"
	"pendaftaran-uib/backend/internal/utils"
)

func Logout(ts *auth.TokenStore, al *audit.Logger) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		base := audit.EntryFromRequest(r)

		var userID, sessionID string

		if claims := auth.GetClaims(r); claims != nil {
			userID = claims.Subject

			if err := ts.Revoke(r.Context(), claims); err != nil {
				slog.Error("logout: revoke access token", "jti", claims.ID, "error", err)
			}
		}

		if cookie, err := r.Cookie("refresh_token"); err == nil {
			if refreshClaims, err := auth.ValidateToken(cookie.Value); err == nil {
				sessionID = refreshClaims.SessionID
				if userID == "" {
					userID = refreshClaims.Subject
				}

				if err := ts.Revoke(r.Context(), refreshClaims); err != nil {
					slog.Error("logout: revoke refresh token", "jti", refreshClaims.ID, "error", err)
				}
				if err := ts.RevokeSession(r.Context(), refreshClaims.SessionID); err != nil {
					slog.Error("logout: RevokeSession", "session_id", refreshClaims.SessionID, "error", err)
				}
			}
		}

		clearRefreshCookie(w)
		lang := utils.Lang(r)

		al.Log(audit.Entry{
			Event: audit.EventLogoutSuccess,
			UserID: userID,
			SessionID: sessionID,
			IP: base.IP,
			UserAgent: base.UserAgent,
			RequestID: base.RequestID,
		})

		utils.WriteJSON(w, http.StatusOK, map[string]string{
			"message": i18n.T("auth.logout_success", lang),
		})
	}
}
