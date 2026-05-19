package models

import (
	"errors"
	"pendaftaran-uib/backend/internal/utils"
	"strings"
)

// VerifyEmailRequest — Token uses a deliberate vague message for security
// TurnstileToken is checked separately in the handler for audit logging
type VerifyEmailRequest struct {
	Token string `json:"token" validate:"-"`
	TurnstileToken string `json:"cf_turnstile_token" validate:"-"`
}

func (r *VerifyEmailRequest) Validate() error {
	if r.Token == "" {
		return errors.New("link verifikasi tidak valid atau sudah kedaluwarsa")
	}
	return nil
}

type ResendVerifyEmailRequest struct {
	Email string `json:"email" validate:"required,email"`
}

func (r *ResendVerifyEmailRequest) Sanitize() {
	r.Email = strings.ToLower(strings.TrimSpace(r.Email))
}

func (r *ResendVerifyEmailRequest) Validate() error {
	return utils.ValidateStruct(r)
}
