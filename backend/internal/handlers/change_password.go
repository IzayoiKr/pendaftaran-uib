package handlers

import (
	"database/sql"
	"errors"
	"log/slog"
	"net/http"

	"pendaftaran-uib/backend/internal/audit"
	"pendaftaran-uib/backend/internal/auth"
	"pendaftaran-uib/backend/internal/crypto"
	"pendaftaran-uib/backend/internal/i18n"
	"pendaftaran-uib/backend/internal/models"
	"pendaftaran-uib/backend/internal/utils"

	"github.com/google/uuid"
)

func ChangePassword(db *sql.DB, ts *auth.TokenStore, al *audit.Logger) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		base := audit.EntryFromRequest(r)
		lang := utils.Lang(r)

		claims := auth.GetClaims(r)
		if claims == nil {
			utils.WriteJSON(w, http.StatusUnauthorized, utils.ErrJSON(i18n.T("common.unauthorized", lang)))
			return
		}

		var req models.ChangePasswordRequest
		if err := utils.DecodeJSON(r, &req); err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON(err.Error()))
			return
		}

		if err := req.Validate(lang); err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON(err.Error()))
			return
		}

		id, err := uuid.Parse(claims.UserID)
		if err != nil {
			slog.Error("change_password: parse uuid from claims", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}


		var currentHash string
		err = db.QueryRowContext(r.Context(),
			"SELECT password_hash FROM users WHERE id = ?",
			id[:],
		).Scan(&currentHash)

		if errors.Is(err, sql.ErrNoRows) {
			utils.WriteJSON(w, http.StatusNotFound, utils.ErrJSON(i18n.T("common.user_not_found", lang)))
			return
		}
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}

		if err := crypto.VerifyPassword(currentHash, req.OldPassword); err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON(i18n.T("auth.old_password_mismatch", lang)))
			return
		}

		newHash, err := crypto.HashPassword(req.NewPassword)
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}

		if _, err = db.ExecContext(r.Context(),
			"UPDATE users SET password_hash = ? WHERE id = ?",
			string(newHash), id[:],
		); err != nil {
			slog.Error("change_password: exec", "user_id", claims.UserID, "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}

		if err := ts.Revoke(r.Context(), claims); err != nil {
			slog.Error("change_password: revoke access token", "jti", claims.ID, "error", err)
		}

		if err := ts.RevokeAllUserSessions(r.Context(), claims.UserID); err != nil {
			slog.Error("change_password: revoke all sessions",
				"user_id", claims.UserID,
				"error", err,
			)
		}

		clearRefreshCookie(w)

		al.Log(audit.Entry{
			Event: audit.EventPasswordChanged,
			UserID: claims.UserID,
			IP: base.IP,
			UserAgent: base.UserAgent,
			RequestID: base.RequestID,
		})

		utils.WriteJSON(w, http.StatusOK, map[string]string{
			"message": "password berhasil diubah, sesi lain telah dinonaktifkan",
		})
	}
}
