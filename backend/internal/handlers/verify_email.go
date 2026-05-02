package handlers

import (
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"pendaftaran-uib/backend/internal/audit"
	"pendaftaran-uib/backend/internal/auth"
	"pendaftaran-uib/backend/internal/models"
	"pendaftaran-uib/backend/internal/utils"
	"time"
)

func VerifyEmail(db *sql.DB, al *audit.Logger) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		base := audit.EntryFromRequest(r)

		var req models.VerifyEmailRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON("permintaan tidak valid"))
			return
		}

		if req.Token == "" {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON("link verifikasi tidak valid atau sudah kadaluwarsa"))
			return
		}

		if req.TurnstileToken == "" {
			al.Log(audit.Entry{
				Event: audit.EventEmailVerificationCaptchaRequired,
				IP: base.IP,
				UserAgent: base.UserAgent,
				RequestID: base.RequestID,
			})
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON("verifikasi CAPTCHA diperlukan"))
			return
		}

		ok, err := auth.VerifyTurnstile(req.TurnstileToken, utils.RealIP(r))
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}
		if !ok {
			al.Log(audit.Entry{
				Event: audit.EventEmailVerificationCaptchaFailure,
				IP: base.IP,
				UserAgent: base.UserAgent,
				RequestID: base.RequestID,
			})
			utils.WriteJSON(w, http.StatusForbidden, utils.ErrJSON("verifikasi CAPTCHA gagal, coba lagi"))
			return
		}

		h := sha256.Sum256([]byte(req.Token))
		tokenHash := hex.EncodeToString(h[:])

		var (
			recordID int64
			userID string
			expiredAt time.Time
			isUsed bool
		)
		err = db.QueryRowContext(r.Context(),
			"SELECT id, user_id, expired_at, is_used FROM email_verification WHERE token_hash = ?",
			tokenHash,
		).Scan(&recordID, &userID, &expiredAt, &isUsed)

		if errors.Is(err, sql.ErrNoRows) {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON("link verifikasi tidak valid atau sudah kadaluwarsa"))
			return
		}
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}
		if isUsed {
			utils.WriteJSON(w, http.StatusBadRequest, map[string]any{
				"error": "link verifikasi tidak valid atau sudah kadaluwarsa",
				"expired": true,
			})
			return
		}
		if time.Now().After(expiredAt) {
			al.Log(audit.Entry{
				Event: audit.EventEmailVerificationExpired,
				UserID: userID,
				IP: base.IP,
				UserAgent: base.UserAgent,
				RequestID: base.RequestID,
			})
			utils.WriteJSON(w, http.StatusBadRequest, map[string]any{
				"error": "link verifikasi tidak valid atau sudah kadaluwarsa",
				"expired": true,
			})
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
					slog.Error("verify_email: rollback", "error", rbErr)
				}
			}
		}()

		if _, err := tx.ExecContext(r.Context(),
			"UPDATE email_verification SET is_used = 1 WHERE id = ?",
			recordID,
		); err != nil {
			slog.Error("verify_email: mark token used", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}

		if _, err := tx.ExecContext(r.Context(),
			"UPDATE user SET email_verified = 1, email_verified_at = NOW() WHERE id = ?",
			userID,
		); err != nil {
			slog.Error("verify_email: mark user verified", "user_id", userID, "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}

		if err = tx.Commit(); err != nil {
			slog.Error("verify_email: commit", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}
		committed = true

		al.Log(audit.Entry{
			Event: audit.EventEmailVerified,
			UserID: userID,
			IP: base.IP,
			UserAgent: base.UserAgent,
			RequestID: base.RequestID,
		})

		utils.WriteJSON(w, http.StatusOK, map[string]string{
			"message": "Email berhasil diverifikasi! Silahkan login.",
		})
	}
}
