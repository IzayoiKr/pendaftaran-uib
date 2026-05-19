package handlers

import (
	"database/sql"
	"errors"
	"log/slog"
	"net/http"
	"pendaftaran-uib/backend/internal/audit"
	"pendaftaran-uib/backend/internal/email"
	"pendaftaran-uib/backend/internal/models"
	"pendaftaran-uib/backend/internal/utils"
	"time"
)

func ResendVerification(db *sql.DB, mailer *email.Mailer, al *audit.Logger) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		base := audit.EntryFromRequest(r)

		const vagueMsg = "link verifikasi telah dikirim"

		var req models.ResendVerifyEmailRequest
		if err := utils.DecodeJSON(r, &req); err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON(err.Error()))
			return
		}

		req.Sanitize()
		if err := req.Validate(); err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON(err.Error()))
			return
		}

		var user models.User
		var idBytes []byte
		err := db.QueryRowContext(r.Context(),
			"SELECT id, full_name, email, email_verified FROM users WHERE email = ?",
			req.Email,
		).Scan(&idBytes, &user.FullName, &user.Email, &user.EmailVerified)

		if errors.Is(err, sql.ErrNoRows) {
			utils.WriteJSON(w, http.StatusOK, map[string]string{"message": vagueMsg})
			return
		}
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}
		if user.EmailVerified {
			utils.WriteJSON(w, http.StatusOK, map[string]string{"message": vagueMsg})
			return
		}

		rawToken, tokenHash, err := generateVerificationToken()
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}

		user.ID, err = utils.UUIDFromBytes(idBytes)
		if err != nil {
			slog.Error("forgot_password: parse uuid to string", "error", err)
		}

		if _, err = db.ExecContext(r.Context(),
			"UPDATE email_verification SET is_used = 1 WHERE user_id = ? AND is_used = 0",
			idBytes,
		); err != nil {
			slog.Error("resend_verification: invalidate old tokens", "user_id", user.ID, "error", err)
		}

		if _, err = db.ExecContext(r.Context(),
			"INSERT INTO email_verification (user_id, token_hash, expired_at) VALUES (?, ?, ?)",
			idBytes, tokenHash, time.Now().Add(verifyTokenTTL),
		); err != nil {
			slog.Error("resend_verification: store token", "user_id", user.ID, "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}

		go func() {
			if err := mailer.SendVerificationEmail(user.Email, user.FullName, rawToken); err != nil {
				slog.Error("resend_verification: send email", "user_id", user.ID, "error", err)
			}
		}()

		al.Log(audit.Entry{
			Event: audit.EventEmailVerificationResent,
			UserID: user.ID,
			Email: user.Email,
			IP: base.IP,
			UserAgent: base.UserAgent,
			RequestID: base.RequestID,
		})

		utils.WriteJSON(w, http.StatusOK, map[string]string{"message": vagueMsg})
	}
}
