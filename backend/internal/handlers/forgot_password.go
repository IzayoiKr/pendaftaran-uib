package handlers

import (
	"database/sql"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"strconv"
	"time"

	"pendaftaran-uib/backend/internal/audit"
	"pendaftaran-uib/backend/internal/auth"
	"pendaftaran-uib/backend/internal/email"
	"pendaftaran-uib/backend/internal/models"
	"pendaftaran-uib/backend/internal/utils"

	"github.com/google/uuid"
)

func ForgotPassword(db *sql.DB, mailer *email.Mailer, emailLimiter *auth.RateLimiter, al *audit.Logger) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		base := audit.EntryFromRequest(r)

		const vagueMsg = "Link reset password telah dikirim"

		var req models.ForgotPasswordRequest
		if err := utils.DecodeJSON(r, &req); err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON(err.Error()))
			return
		}

		req.Sanitize()
		if err := req.Validate(); err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON(err.Error()))
			return
		}

		if req.TurnstileToken == "" {
			al.Log(audit.Entry{
				Event: audit.EventPasswordForgotCaptchaRequired,
				Email: req.Email,
				IP: base.IP,
				UserAgent: base.UserAgent,
				RequestID: base.RequestID,
			})
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON("verifikasi CAPTCHA diperlukan"))
			return
		}

		if allowed, retryAfter := emailLimiter.Allow(req.Email); !allowed {
			al.Log(audit.Entry{
				Event: audit.EventPasswordForgotBlocked,
				Email: req.Email,
				IP: base.IP,
				UserAgent: base.UserAgent,
				RequestID: base.RequestID,
				Meta: map[string]any{"retry_after_seconds": int(retryAfter.Seconds())},
			})
			w.Header().Set("Retry-After", strconv.Itoa(int(retryAfter.Seconds())))
			utils.WriteJSON(w, http.StatusTooManyRequests, utils.ErrJSON(
				fmt.Sprintf("terlalu banyak percobaan, coba lagi dalam %d detik",
					int(retryAfter.Seconds())),
			))
			return
		}

		ok, err := auth.VerifyTurnstile(req.TurnstileToken, utils.RealIP(r))
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}
		if !ok {
			al.Log(audit.Entry{
				Event: audit.EventPasswordForgotCaptchaFailure,
				Email: req.Email,
				IP: base.IP,
				UserAgent: base.UserAgent,
				RequestID: base.RequestID,
			})
			utils.WriteJSON(w, http.StatusUnauthorized, utils.ErrJSON("verifikasi CAPTCHA gagal, coba lagi"))
			return
		}

		var (
			id uuid.UUID
			fullName string
		)
		err = db.QueryRowContext(r.Context(),
			"SELECT id, full_name FROM users WHERE email = ?",
			req.Email,
		).Scan(&id, &fullName)

		if errors.Is(err, sql.ErrNoRows) {
			al.Log(audit.Entry{
				Event: audit.EventPasswordResetRequested,
				Email: req.Email,
				IP: base.IP,
				UserAgent: base.UserAgent,
				RequestID: base.RequestID,
				Meta: map[string]any{"found": false},
			})
			utils.WriteJSON(w, http.StatusOK, map[string]string{"message": vagueMsg})
			return
		}
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}

		rawToken, tokenHash, err := generateVerificationToken()
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}

		expiry := time.Now().Add(resetTokenTTL)
		if _, err = db.ExecContext(r.Context(),
			"INSERT INTO reset_password (user_id, token_hash, expired_at) VALUES (?, ?, ?)",
			id[:], tokenHash, expiry,
		); err != nil {
			slog.Error("forgot_password: store token hash", "user_id", id.String(), "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}

		go func() {
			if err := mailer.SendPasswordResetEmail(req.Email, fullName, rawToken); err != nil {
				slog.Error("forgot_password: send reset password email", "user_id", id.String, "error", err)
			}
		}()

		al.Log(audit.Entry{
			Event: audit.EventPasswordResetRequested,
			UserID: id.String(),
			Email: req.Email,
			IP: base.IP,
			UserAgent: base.UserAgent,
			RequestID: base.RequestID,
			Meta: map[string]any{"found": true, "expires_at": expiry},
		})

		utils.WriteJSON(w, http.StatusOK, map[string]string{"message": vagueMsg})
	}
}
