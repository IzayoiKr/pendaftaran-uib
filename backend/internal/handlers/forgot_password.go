package handlers

import (
	"crypto/rand"
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"net/mail"
	"strings"
	"time"

	"pendaftaran-uib/backend/internal/audit"
	"pendaftaran-uib/backend/internal/auth"
	"pendaftaran-uib/backend/internal/email"
	"pendaftaran-uib/backend/internal/models"
	"pendaftaran-uib/backend/internal/utils"
)

func ForgotPassword(db *sql.DB, mailer *email.Mailer, emailLimiter *auth.RateLimiter, al *audit.Logger) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		base := audit.EntryFromRequest(r)

		var req models.ForgotPasswordRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON("permintaan tidak valid"))
			return
		}

		if req.Email == "" || req.NIK == "" {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON("email dan NIK harus diisi"))
			return
		}

		if req.TurnstileToken == "" {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON("verifikasi CAPTCHA diperlukan"))
			return
		}

		const vagueMsg = "Link reset password telah dikirim"

		req.Email = strings.ToLower(req.Email)

		if allowed, retryAfter := emailLimiter.Allow(req.Email); !allowed {
			al.Log(audit.Entry{
				Event: audit.EventPasswordForgotBlocked,
				Email: req.Email,
				IP: base.IP,
				UserAgent: base.UserAgent,
				RequestID: base.RequestID,
				Meta: map[string]any{"retry_after_seconds": int(retryAfter.Seconds())},
			})
			w.Header().Set("Retry-After", retryAfterString(retryAfter))
			utils.WriteJSON(w, http.StatusTooManyRequests, utils.ErrJSON(
				fmt.Sprintf("terlalu banyak percobaan, coba lagi dalam %d detik",
					int(retryAfter.Seconds())),
			))
			return
		}

		if _, err := mail.ParseAddress(req.Email); err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON("format email tidak valid"))
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
			userID string
			fullName string
		)
		err = db.QueryRowContext(r.Context(),
			"SELECT id, full_name FROM user WHERE email = ? and nik = ?",
			req.Email, req.NIK,
		).Scan(&userID, &fullName)

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

		_, _ = db.ExecContext(r.Context(),
			"DELETE FROM reset_password WHERE expired_at < NOW()",
		)

		tokenBytes := make([]byte, 32)
		if _, err := rand.Read(tokenBytes); err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}
		rawToken := hex.EncodeToString(tokenBytes)
		h := sha256.Sum256([]byte(rawToken))
		tokenHash := hex.EncodeToString(h[:])

		expiry := time.Now().Add(resetTokenTTL)

		_, err = db.ExecContext(r.Context(),
			"INSERT INTO reset_password (user_id, token_hash, expired_at) VALUES (?, ?, ?)",
			userID, tokenHash, expiry,
		)
		if err != nil {
			slog.Error("forgot_password: store token hash", "user_id", userID, "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}

		go func() {
			if err := mailer.SendPasswordResetEmail(req.Email, fullName, rawToken); err != nil {
				slog.Error("forgot_password: send reset password email", "user_id", userID, "error", err)
			}
		}()

		al.Log(audit.Entry{
			Event: audit.EventPasswordResetRequested,
			UserID: userID,
			Email: req.Email,
			IP: base.IP,
			UserAgent: base.UserAgent,
			RequestID: base.RequestID,
			Meta: map[string]any{"found": true, "expires_at": expiry},
		})

		utils.WriteJSON(w, http.StatusOK, map[string]string{"message": vagueMsg})
	}
}
