package audit

import (
	"log/slog"
	"net/http"

	"github.com/go-chi/chi/v5/middleware"

	"pendaftaran-uib/backend/internal/utils"
)

type Event string

const (
	EventLoginSuccess Event = "login.success"
	EventLoginFailure Event = "login.failure"
	EventLoginBlocked Event = "login.blocked"
	EventLoginCaptchaRequired Event = "login.captcha_required"
	EventLoginCaptchaFailure Event = "login.captcha_failure"

	EventRegisterSuccess Event = "register.success"
	EventRegisterFailure Event = "register.failure"
	EventRegisterCaptchaRequired Event = "register.captcha_required"
	EventRegisterCaptchaFailure Event = "register.captcha_failure"

	EventEmailVerificationSent Event = "email.verification_sent"
	EventEmailVerified Event = "email.verified"
	EventEmailVerificationResent Event = "email.verification_resent"
	EventEmailVerificationUsed Event = "email.verification_used"
	EventEmailVerificationExpired Event = "email.verification_expired"
	EventEmailVerificationCaptchaRequired Event = "email.captcha_required"
	EventEmailVerificationCaptchaFailure Event = "email.captcha_failure"

	EventLogoutSuccess Event = "logout.success"

	EventRefreshSuccess Event = "refresh.success"
	EventRefreshReuseDetected Event = "refresh.reuse_detected"
	EventRefreshFailure Event = "refresh.failure"

	EventProfileUpdated Event = "profile.updated"
	EventNIKRevealed Event = "profile.nik_revealed"

	EventPasswordChanged Event = "password.changed"

	EventPasswordForgotBlocked Event = "password_forgot.blocked"
	EventPasswordForgotCaptchaRequired Event = "password_forgot.captcha_required"
	EventPasswordForgotCaptchaFailure Event = "password_forgot.captcha_failure"

	EventPasswordResetRequested Event = "password_reset.requested"
	EventPasswordResetSuccess Event = "password_reset.success"
	EventPasswordResetUsed Event = "password_reset.used"
	EventPasswordResetExpired Event = "password_reset.expired"
)

type Entry struct {
	Event Event
	UserID string
	Email string
	SessionID string
	IP string
	UserAgent string
	RequestID string
	Meta map[string]any
}

type Logger struct{}

func NewLogger() *Logger {
	return &Logger{}
}

func (l *Logger) Log(e Entry) {
	if l == nil {
		return
	}

	attrs := []any{
		"event", string(e.Event),
		"ip", e.IP,
	}
	if e.UserID != "" {
		attrs = append(attrs, "user_id", e.UserID)
	}
	if e.Email != "" {
		attrs = append(attrs, "email", e.Email)
	}
	if e.SessionID != "" {
		attrs = append(attrs, "session_id", e.SessionID)
	}
	if e.RequestID != "" {
		attrs = append(attrs, "request_id", e.RequestID)
	}
	if len(e.Meta) > 0 {
		attrs = append(attrs, "meta", e.Meta)
	}

	slog.Info("AUDIT", attrs...)
}

func EntryFromRequest(r *http.Request) Entry {
	return Entry{
		IP:        utils.RealIP(r),
		UserAgent: r.Header.Get("User-Agent"),
		RequestID: middleware.GetReqID(r.Context()),
	}
}
