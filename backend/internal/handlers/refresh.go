package handlers

import (
	"database/sql"
	"errors"
	"log/slog"
	"net/http"
	"time"

	"pendaftaran-uib/backend/internal/audit"
	"pendaftaran-uib/backend/internal/auth"
	"pendaftaran-uib/backend/internal/models"
	"pendaftaran-uib/backend/internal/utils"

	"github.com/google/uuid"
)

func Refresh(db *sql.DB, ts *auth.TokenStore, al *audit.Logger) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		base := audit.EntryFromRequest(r)

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

		revoked, err := ts.IsRevoked(r.Context(), claims.ID)
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}
		if revoked {
			clearRefreshCookie(w)
			al.Log(audit.Entry{
				Event: audit.EventRefreshFailure,
				UserID: claims.UserID,
				SessionID: claims.SessionID,
				IP: base.IP,
				UserAgent: base.UserAgent,
				RequestID: base.RequestID,
				Meta: map[string]any{"reason": "jti_revoked", "jti": claims.ID},
			})
			utils.WriteJSON(w, http.StatusUnauthorized, utils.ErrJSON("token has been revoked"))
			return
		}

		consumed, err := ts.ConsumeSession(r.Context(), sessionID)
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}
		if !consumed {
			clearRefreshCookie(w)
			al.Log(audit.Entry{
				Event: audit.EventRefreshReuseDetected,
				UserID: claims.UserID,
				SessionID: claims.SessionID,
				IP: base.IP,
				UserAgent: base.UserAgent,
				RequestID: base.RequestID,
				Meta: map[string]any{"jti": claims.ID},
			})
			slog.Warn("SECURITY: refresh on missing/expired session - possible token reuse",
				"session_id", sessionID,
				"user_id", claims.UserID)
			utils.WriteJSON(w, http.StatusUnauthorized, utils.ErrJSON("sesi tidak valid, silahkan login kembali"))
			return
		}

		id, err := uuid.Parse(claims.UserID)
		if err != nil {
			slog.Error("refresh: parse uuid from claims", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}

		var user models.User
		err = db.QueryRowContext(r.Context(),
			`SELECT full_name, nik, email FROM users WHERE id = ?`,
			id[:],
		).Scan(&user.FullName, &user.NIK, &user.Email)

		if errors.Is(err, sql.ErrNoRows) {
			clearRefreshCookie(w)
			utils.WriteJSON(w, http.StatusUnauthorized, utils.ErrJSON("user tidak ditemukan"))
			return
		}
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}

		newSessionID := utils.GenerateUUIDString()

		if err := ts.StoreSession(r.Context(), newSessionID, claims.UserID, time.Now().Add(auth.RefreshTokenTTL)); err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}

		newAccessToken, err := auth.GenerateAccessToken(claims.UserID, newSessionID, user.Email)
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}

		newRefreshToken, err := auth.GenerateRefreshToken(claims.UserID, newSessionID, user.Email)
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}

		if err := ts.Revoke(r.Context(), claims); err != nil {
			slog.Error("refresh: blacklist old refresh JTI",
				"jti", claims.ID,
				"error", err)
		}

		setRefreshCookie(w, newRefreshToken)

		al.Log(audit.Entry{
			Event: audit.EventRefreshSuccess,
			UserID: claims.UserID,
			SessionID: newSessionID,
			IP: base.IP,
			UserAgent: base.UserAgent,
			RequestID: base.RequestID,
			Meta: map[string]any{"old_session_id": sessionID},
		})

		maskedNIK := decryptAndMask(user.NIK)
		utils.WriteJSON(w, http.StatusOK, accessTokenResponse{
			AccessToken: newAccessToken,
			User: user.ToDTO(maskedNIK),
		})
	}
}
