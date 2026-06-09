package handlers

import (
	"database/sql"
	"errors"
	"log/slog"
	"net/http"
	"time"

	"pendaftaran-uib/backend/internal/audit"
	"pendaftaran-uib/backend/internal/auth"
	"pendaftaran-uib/backend/internal/i18n"
	"pendaftaran-uib/backend/internal/models"
	"pendaftaran-uib/backend/internal/utils"

	"github.com/google/uuid"
)

func VerifyEmail(db *sql.DB, al *audit.Logger) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		base := audit.EntryFromRequest(r)
		lang := utils.Lang(r)

		vagueMsg := i18n.T("auth.vague_verify_msg", lang)

		var req models.VerifyEmailRequest
		if err := utils.DecodeJSON(r, &req); err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON(err.Error()))
			return
		}

		if err := req.Validate(lang); err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON(err.Error()))
			return
		}

		if req.TurnstileToken == "" {
			al.Log(audit.Entry{
				Event: audit.EventEmailVerificationCaptchaRequired,
				IP: base.IP,
				UserAgent: base.UserAgent,
				RequestID: base.RequestID,
			})
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON(i18n.T("auth.captcha_required", lang)))
			return
		}

		ok, err := auth.VerifyTurnstile(req.TurnstileToken, utils.RealIP(r))
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}
		if !ok {
			al.Log(audit.Entry{
				Event: audit.EventEmailVerificationCaptchaFailure,
				IP: base.IP,
				UserAgent: base.UserAgent,
				RequestID: base.RequestID,
			})
			utils.WriteJSON(w, http.StatusForbidden, utils.ErrJSON(i18n.T("auth.captcha_failed", lang)))
			return
		}

		tokenHash := utils.HashToken(req.Token)

		var (
			recordID int64
			userID uuid.UUID
			expiredAt time.Time
			isUsed bool
		)
		err = db.QueryRowContext(r.Context(),
			"SELECT id, user_id, expired_at, is_used FROM email_verification WHERE token_hash = ?",
			tokenHash,
		).Scan(&recordID, &userID, &expiredAt, &isUsed)

		if errors.Is(err, sql.ErrNoRows) {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON(vagueMsg))
			return
		}
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}

		if isUsed || time.Now().After(expiredAt) {
			if isUsed {
				al.Log(audit.Entry{
					Event: audit.EventEmailVerificationUsed,
					UserID: userID.String(),
					IP: base.IP,
					UserAgent: base.UserAgent,
					RequestID: base.RequestID,
				})
			} else {
				al.Log(audit.Entry{
					Event: audit.EventEmailVerificationExpired,
					UserID: userID.String(),
					IP: base.IP,
					UserAgent: base.UserAgent,
					RequestID: base.RequestID,
				})
			}
			utils.WriteJSON(w, http.StatusBadRequest, map[string]any{
				"error": vagueMsg,
				"expired": true,
			})
			return
		}

		tx, err := db.BeginTx(r.Context(), nil)
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}
		committed := false
		defer func() {
			if !committed {
				if rbErr := tx.Rollback(); rbErr != nil {
					slog.Error("verify_email: rollback", "error", rbErr)
				}
			}
		}()

		if _, err := tx.ExecContext(r.Context(),
			"UPDATE email_verification SET is_used = 1 WHERE id = ?",
			recordID,
		); err != nil {
			slog.Error("verify_email: mark token used", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}

		if _, err := tx.ExecContext(r.Context(),
			"UPDATE users SET email_verified = 1, email_verified_at = NOW() WHERE id = ?",
			userID[:],
		); err != nil {
			slog.Error("verify_email: mark user verified", "user_id", userID.String(), "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}

		if err = tx.Commit(); err != nil {
			slog.Error("verify_email: commit", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}
		committed = true

		al.Log(audit.Entry{
			Event: audit.EventEmailVerified,
			UserID: userID.String(),
			IP: base.IP,
			UserAgent: base.UserAgent,
			RequestID: base.RequestID,
		})

		utils.WriteJSON(w, http.StatusOK, map[string]string{
			"message": i18n.T("auth.verify_success", lang),
		})
	}
}
