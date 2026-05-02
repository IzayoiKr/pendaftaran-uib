package handlers

import (
	"database/sql"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"net/mail"
	"pendaftaran-uib/backend/internal/audit"
	"pendaftaran-uib/backend/internal/email"
	"pendaftaran-uib/backend/internal/models"
	"pendaftaran-uib/backend/internal/utils"
	"strings"
	"time"
)

func ResendVerification(db *sql.DB, mailer *email.Mailer, al *audit.Logger) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		base := audit.EntryFromRequest(r)

		const vagueMsg = "link verifikasi telah dikirim"

		var req models.ResendVerifyEmailRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON("permintaan tidak valid"))
			return
		}

		req.Email = strings.ToLower(req.Email)

		if req.Email == "" {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON("email wajib diisi"))
			return
		}

		if _, err := mail.ParseAddress(req.Email); err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON("format email tidak valid"))
			return
		}

		var user models.User
		err := db.QueryRowContext(r.Context(),
			"SELECT id, full_name, email, email_verified FROM user WHERE email = ?",
			req.Email,
		).Scan(&user.ID, &user.FullName, &user.Email, &user.EmailVerified)

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

		_, _ = db.ExecContext(r.Context(),
			"DELETE FROM email_verification WHERE expired_at < NOW()",
		)

		rawToken, tokenHash, err := generateVerificationToken()
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}

		if _, err = db.ExecContext(r.Context(),
			"UPDATE email_verification SET is_used = 1 WHERE user_id = ? AND is_used = 0",
			user.ID,
		); err != nil {
			slog.Error("resend_verification: invalidate old tokens", "user_id", user.ID, "error", err)
		}

		if _, err = db.ExecContext(r.Context(),
			"INSERT INTO email_verification (user_id, token_hash, expired_at) VALUES (?, ?, ?)",
			user.ID, tokenHash, time.Now().Add(verifyTokenTTL),
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
