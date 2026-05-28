package handlers

import (
	"database/sql"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"pendaftaran-uib/backend/internal/audit"
	"pendaftaran-uib/backend/internal/auth"
	"pendaftaran-uib/backend/internal/crypto"
	"pendaftaran-uib/backend/internal/models"
	"pendaftaran-uib/backend/internal/utils"
)

const captchaThreshold = 3

func Login(db *sql.DB, ts *auth.TokenStore, emailLimiter *auth.RateLimiter, al *audit.Logger) http.HandlerFunc {
	tracker := auth.NewFailedAttempts()

	return func(w http.ResponseWriter, r *http.Request) {
		base := audit.EntryFromRequest(r)

		var req models.LoginRequest
		if err := utils.DecodeJSON(r, &req); err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON(err.Error()))
			return
		}

		req.Sanitize()
		if err := req.Validate(); err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON(err.Error()))
			return
		}

		if allowed, retryAfter := emailLimiter.Allow(req.Email); !allowed {
			al.Log(audit.Entry{
				Event: audit.EventLoginBlocked,
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

		captchaRequired := tracker.Count(req.Email) >= captchaThreshold
		if captchaRequired {
			if req.TurnstileToken == "" {
				al.Log(audit.Entry{
					Event: audit.EventLoginCaptchaRequired,
					Email: req.Email,
					IP: base.IP,
					UserAgent: base.UserAgent,
					RequestID: base.RequestID,
				})
				w.Header().Set("X-Auth-Error", "credentials")
				utils.WriteJSON(w, http.StatusUnauthorized, models.LoginErrorResponse{
					Error: "verifikasi CAPTCHA diperlukan",
					RequireCaptcha: true,
				})
				return
			}

			ok, err := auth.VerifyTurnstile(req.TurnstileToken, utils.RealIP(r))
			if err != nil {
				utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
				return
			}
			if !ok {
				al.Log(audit.Entry{
					Event: audit.EventLoginCaptchaFailure,
					Email: req.Email,
					IP: base.IP,
					UserAgent: base.UserAgent,
					RequestID: base.RequestID,
				})
				w.Header().Set("X-Auth-Error", "credentials")
				utils.WriteJSON(w, http.StatusForbidden, models.LoginErrorResponse{
					Error: "verifikasi CAPTCHA gagal, coba lagi",
					RequireCaptcha: true,
				})
				return
			}
		}

		var user models.User
		err := db.QueryRowContext(r.Context(),
			"SELECT id, full_name, nik, email, password_hash, email_verified FROM users WHERE email = ?",
			req.Email,
		).Scan(&user.ID, &user.FullName, &user.NIK, &user.Email, &user.PasswordHash, &user.EmailVerified)

		if errors.Is(err, sql.ErrNoRows) {
			failCount := tracker.Increment(req.Email)
			al.Log(audit.Entry{
				Event: audit.EventLoginFailure,
				Email: req.Email,
				IP: base.IP,
				UserAgent: base.UserAgent,
				RequestID: base.RequestID,
				Meta: map[string]any{"reason": "wrong_password", "fail_count": failCount},
			})
			w.Header().Set("X-Auth-Error", "credentials")
			utils.WriteJSON(w, http.StatusUnauthorized, models.LoginErrorResponse{
				Error: "email atau password salah",
				RequireCaptcha: failCount >= captchaThreshold,
			})
			return
		}
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}

		if err := crypto.VerifyPassword(user.PasswordHash, req.Password); err != nil {
			failCount := tracker.Increment(req.Email)
			al.Log(audit.Entry{
				Event: audit.EventLoginFailure,
				UserID: user.ID.String(),
				Email: req.Email,
				IP: base.IP,
				UserAgent: base.UserAgent,
				RequestID: base.RequestID,
				Meta: map[string]any{"reason": "wrong_password", "fail_count": failCount},
			})
			w.Header().Set("X-Auth-Error", "credentials")
			utils.WriteJSON(w, http.StatusUnauthorized, models.LoginErrorResponse{
				Error: "email atau password salah",
				RequireCaptcha: failCount >= captchaThreshold,
			})
			return
		}

		tracker.Reset(req.Email)

		if !user.EmailVerified {
			utils.WriteJSON(w, http.StatusForbidden, map[string]any{
				"error": "email belum diverifikasi, silahkan cek inbox Anda",
				"require_verify": true,
				"email": user.Email,
			})
			return
		}

		sessionID := utils.GenerateUUIDString()

		accessToken, err := auth.GenerateAccessToken(user.ID.String(), sessionID, user.Email)
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}

		refreshToken, err := auth.GenerateRefreshToken(user.ID.String(), sessionID, user.Email)
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}

		if err := ts.StoreSession(r.Context(), sessionID, user.ID.String(), time.Now().Add(auth.RefreshTokenTTL)); err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}

		al.Log(audit.Entry{
			Event: audit.EventLoginSuccess,
			UserID: user.ID.String(),
			Email: user.Email,
			SessionID: sessionID,
			IP: base.IP,
			UserAgent: base.UserAgent,
			RequestID: base.RequestID,
		})

		setRefreshCookie(w, refreshToken)

		maskedNIK := decryptAndMask(user.NIK)
		utils.WriteJSON(w, http.StatusOK, accessTokenResponse{
			AccessToken: accessToken,
			User: user.ToDTO(maskedNIK),
		})
	}
}
