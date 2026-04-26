package handlers

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"sync"
	"time"

	"pendaftaran-uib/backend/internal/auth"
	"pendaftaran-uib/backend/internal/models"
	"pendaftaran-uib/backend/internal/utils"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

const captchaThreshold = 3

const failedAttemptWindow = 15 * time.Minute

type loginRequest struct {
	Email string `json:"email"`
	Password string `json:"password"`
	TurnstileToken string `json:"cf_turnstile_token,omitempty"`
}

type loginErrorResponse struct {
	Error string `json:"error"`
	RequireCaptcha bool `json:"require_captcha,omitempty"`
}

type accessTokenResponse struct {
	AccessToken string `json:"access_token"`
	User models.UserDTO `json:"user"`
}

type failedAttempts struct {
	mu sync.Mutex
	entries map[string]*attemptEntry
}

type attemptEntry struct {
	count int
	expiresAt time.Time
}

func Login(db *sql.DB, ts *auth.TokenStore, emailLimiter *auth.RateLimiter) http.HandlerFunc {
	tracker := newFailedAttempts()

	return func(w http.ResponseWriter, r *http.Request) {
		var req loginRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON("permintaan tidak valid"))
			return
		}
		if req.Email == "" || req.Password == "" {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON("email dan password wajib diisi"))
			return
		}

		if allowed, retryAfter := emailLimiter.Allow(req.Email); !allowed {
			w.Header().Set("Retry-After", retryAfterString(retryAfter))
			w.Header().Set("X-Auth-Error", "credentials")
			utils.WriteJSON(w, http.StatusTooManyRequests, utils.ErrJSON(
				fmt.Sprintf("terlalu banyak percobaan, coba lagi dalam %d detik",
					int(retryAfter.Seconds())),
			))
			return
		}

		captchaRequired := tracker.count(req.Email) >= captchaThreshold
		if captchaRequired {
			if req.TurnstileToken == "" {
				w.Header().Set("X-Auth-Error", "credentials")
				utils.WriteJSON(w, http.StatusUnauthorized, loginErrorResponse{
					Error: "verifikasi CAPTCHA diperlukan",
					RequireCaptcha: true,
				})
				return
			}

			ok, err := verifyTurnstile(req.TurnstileToken, utils.RealIP(r))
			if err != nil {
				utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
				return
			}
			if !ok {
				w.Header().Set("X-Auth-Error", "credentials")
				utils.WriteJSON(w, http.StatusForbidden, loginErrorResponse{
					Error: "verifikasi CAPTCHA gagal, coba lagi",
					RequireCaptcha: true,
				})
				return
			}
		}

		var user models.User
		err := db.QueryRowContext(r.Context(),
			`SELECT id, full_name, nik, email, password_hash
			 FROM users WHERE email = ?`,
			req.Email,
		).Scan(&user.ID, &user.FullName, &user.NIK, &user.Email, &user.PasswordHash)

		if errors.Is(err, sql.ErrNoRows) {
			failCount := tracker.increment(req.Email)
			needsCaptcha := failCount >= captchaThreshold
			w.Header().Set("X-Auth-Error", "credentials")
			utils.WriteJSON(w, http.StatusUnauthorized, loginErrorResponse{
				Error: "email atau password salah",
				RequireCaptcha: needsCaptcha,
			})
			return
		}
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}

		if err := bcrypt.CompareHashAndPassword(
			[]byte(user.PasswordHash), []byte(req.Password),
		); err != nil {
			failCount := tracker.increment(req.Email)
			needsCaptcha := failCount >= captchaThreshold
			w.Header().Set("X-Auth-Error", "credentials")
			utils.WriteJSON(w, http.StatusUnauthorized, loginErrorResponse{
				Error: "email atau password salah",
				RequireCaptcha: needsCaptcha,
			})
			return
		}

		tracker.reset(req.Email)

		sessionID := uuid.NewString()

		accessToken, err := auth.GenerateAccessToken(user.ID, sessionID, user.Email)
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}

		refreshToken, err := auth.GenerateRefreshToken(user.ID, sessionID, user.Email)
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}

		if err := ts.StoreSession(r.Context(), sessionID, user.ID, time.Now().Add(auth.RefreshTokenTTL)); err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}

		setRefreshCookie(w, refreshToken)

		utils.WriteJSON(w, http.StatusOK, accessTokenResponse{
			AccessToken: accessToken,
			User: user.ToDTO(),
		})
	}
}

func newFailedAttempts() *failedAttempts {
	fa := &failedAttempts{entries: make(map[string]*attemptEntry)}
	go fa.periodicCleanup()
	return fa
}

func (fa *failedAttempts) increment(key string) int {
	fa.mu.Lock()
	defer fa.mu.Unlock()

	now := time.Now()
	entry, exists := fa.entries[key]
	if !exists || entry.expiresAt.Before(now) {
		fa.entries[key] = &attemptEntry{count: 1, expiresAt: now.Add(failedAttemptWindow)}
		return 1
	}

	entry.count++
	return entry.count
}

func (fa *failedAttempts) count(key string) int {
	fa.mu.Lock()
	defer fa.mu.Unlock()

	entry, exists := fa.entries[key]
	if !exists || entry.expiresAt.Before(time.Now()) {
		return 0
	}

	return entry.count
}

func (fa *failedAttempts) reset(key string) {
	fa.mu.Lock()
	defer fa.mu.Unlock()
	delete(fa.entries, key)
}

func (fa *failedAttempts) periodicCleanup() {
	ticker := time.NewTicker(failedAttemptWindow)
	defer ticker.Stop()
	for range ticker.C {
		fa.mu.Lock()
		now := time.Now()
		for k, v := range fa.entries {
			if v.expiresAt.Before(now) {
				delete(fa.entries, k)
			}
		}
		fa.mu.Unlock()
	}
}

func retryAfterString(d time.Duration) string {
	return strconv.Itoa(int(d.Seconds()))
}
