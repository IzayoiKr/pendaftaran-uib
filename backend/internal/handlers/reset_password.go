package handlers

import (
	"database/sql"
	"errors"
	"log/slog"
	"net/http"
	"pendaftaran-uib/backend/internal/audit"
	"pendaftaran-uib/backend/internal/auth"
	"pendaftaran-uib/backend/internal/models"
	"pendaftaran-uib/backend/internal/utils"
	"time"

	"golang.org/x/crypto/bcrypt"
)

func ResetPassword(db *sql.DB, ts *auth.TokenStore, al *audit.Logger) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		base := audit.EntryFromRequest(r)

		var req models.ResetPasswordRequest
		if err := utils.DecodeJSON(r, &req); err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON(err.Error()))
			return
		}

		if err := req.Validate(); err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON(err.Error()))
			return
		}

		tokenHash := utils.HashToken(req.Token)

		var (
			recordID int64
			userID string
			expiredAt time.Time
			isUsed bool
		)
		err := db.QueryRowContext(r.Context(),
			"SELECT id, user_id, expired_at, is_used FROM reset_password WHERE token_hash = ?",
			tokenHash,
		).Scan(&recordID, &userID, &expiredAt, &isUsed)

		if errors.Is(err, sql.ErrNoRows) {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON("link tidak valid atau sudah kadaluwarsa"))
			return
		}
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}

		if isUsed || time.Now().After(expiredAt) {
			if isUsed {
				al.Log(audit.Entry{
					Event: audit.EventPasswordResetUsed,
					UserID: userID,
					IP: base.IP,
					UserAgent: base.UserAgent,
					RequestID: base.RequestID,
				})
			} else {
				al.Log(audit.Entry{
					Event: audit.EventPasswordResetExpired,
					UserID: userID,
					IP: base.IP,
					UserAgent: base.UserAgent,
					RequestID: base.RequestID,
				})
			}
			utils.WriteJSON(w, http.StatusBadRequest, map[string]any{
				"error": "link verifikasi tidak valid atau sudah kadaluwarsa",
				"expired": true,
			})
			return
		}

		newHash, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}

		tx, err := db.BeginTx(r.Context(), nil)
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}
		committed := false
		defer func() {
			if !committed {
				if rbErr := tx.Rollback(); rbErr != nil {
					slog.Error("reset_password: rollback", "error", rbErr)
				}
			}
		}()

		if _, err = tx.ExecContext(r.Context(),
			"UPDATE user SET password_hash = ? WHERE id = ?",
			string(newHash), userID,
		); err != nil {
			slog.Error("reset_password: update password:", "user_id", userID, "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}

		if _, err = tx.ExecContext(r.Context(),
			"UPDATE reset_password SET is_used = 1 WHERE id = ?",
			recordID,
		); err != nil {
			slog.Error("reset_password: mark token used", "record_id", recordID, "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}

		if err = tx.Commit(); err != nil {
			slog.Error("reset_password: commit", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
		}
		committed = true

		if err := ts.RevokeAllUserSessions(r.Context(), userID); err != nil {
			slog.Error("reset_passsword: revoke all sessions", "user_id", userID, "error", err)
		}

		al.Log(audit.Entry{
			Event: audit.EventPasswordResetSuccess,
			UserID: userID,
			IP: base.IP,
			UserAgent: base.UserAgent,
			RequestID: base.RequestID,
		})

		utils.WriteJSON(w, http.StatusOK, map[string]string{
			"message": "password berhasil direset, silahkan login kembali",
		})
	}
}
