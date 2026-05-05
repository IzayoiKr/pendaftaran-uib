package handlers

import (
	"database/sql"
	"errors"
	"log/slog"
	"net/http"
	"time"

	"pendaftaran-uib/backend/internal/audit"
	"pendaftaran-uib/backend/internal/auth"
	"pendaftaran-uib/backend/internal/email"
	"pendaftaran-uib/backend/internal/models"
	"pendaftaran-uib/backend/internal/utils"

	"github.com/go-sql-driver/mysql"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

func Register(db *sql.DB, mailer *email.Mailer, al *audit.Logger) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		base := audit.EntryFromRequest(r)

		var req models.RegisterRequest
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
				Event: audit.EventRegisterCaptchaRequired,
				Email: req.Email,
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
				Event: audit.EventRegisterCaptchaFailure,
				Email: req.Email,
				IP: base.IP,
				UserAgent: base.UserAgent,
				RequestID: base.RequestID,
			})
			utils.WriteJSON(w, http.StatusForbidden, utils.ErrJSON("verifikasi CAPTCHA gagal, coba lagi"))
			return
		}

		hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}

		id := uuid.NewString()

		_, err = db.ExecContext(r.Context(),
			"INSERT INTO user (id, full_name, nik, email, password_hash) VALUES (?, ?, ?, ?, ?)",
		 id, req.FullName, req.NIK, req.Email, string(hash),
		)
		if err != nil {
			var mysqlErr *mysql.MySQLError
			if errors.As(err, &mysqlErr) && mysqlErr.Number == 1062 {
				al.Log(audit.Entry{
					Event: audit.EventRegisterFailure,
					Email: req.Email,
					IP: base.IP,
					UserAgent: base.UserAgent,
					RequestID: base.RequestID,
					Meta: map[string]any{"reason": "email_already_exists"},
				})
				utils.WriteJSON(w, http.StatusCreated, map[string]string{
					"message": "Registrasi berhasil! Silahkan cek email anda untuk verifikasi",
				})
				return
			}
			slog.Error("register: insert user", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}

		al.Log(audit.Entry{
			Event: audit.EventRegisterSuccess,
			UserID: id,
			Email: req.Email,
			IP: base.IP,
			UserAgent: base.UserAgent,
			RequestID: base.RequestID,
		})

		rawToken, tokenHash, err := generateVerificationToken()
		if err != nil {
			slog.Error("register: generate verification token", "user_id", id, "error", err)
			utils.WriteJSON(w, http.StatusCreated, map[string]string{
				"message": "Registrasi berhasil! Silahkan cek email Anda untuk verifikasi",
			})
			return
		}

		if _, err = db.ExecContext(r.Context(),
			"INSERT INTO email_verification (user_id, token_hash, expired_at) VALUES (?, ?, ?)",
			id, tokenHash, time.Now().Add(verifyTokenTTL),
		); err != nil {
			slog.Error("register: store verification token", "user_id", id, "error", err)
			utils.WriteJSON(w, http.StatusCreated, map[string]string{
				"message": "Registrasi berhasil! Silahkan cek email Anda untuk verifikasi",
			})
			return
		}

		go func() {
			if err := mailer.SendVerificationEmail(req.Email, req.FullName, rawToken); err != nil {
				slog.Error("register: send verification email", "user_id", id, "error", err)
			}
		}()

		utils.WriteJSON(w, http.StatusCreated, map[string]string{
			"message": "Registrasi berhasil! Silahkan cek email Anda untuk verifikasi",
		})
	}
}
