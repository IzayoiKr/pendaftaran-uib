package models

import (
	"errors"
	"net/mail"
	"strings"
)

type VerifyEmailRequest struct {
	Token string `json:"token"`
	TurnstileToken string `json:"cf_turnstile_token"`
}

func (r *VerifyEmailRequest) Validate() error {
	if r.Token == "" {
		return errors.New("link verifikasi tidak valid atau sudah kedaluwarsa")
	}
	return nil
}

type ResendVerifyEmailRequest struct {
	Email string `json:"email"`
}

func (r *ResendVerifyEmailRequest) Sanitize() {
	r.Email = strings.ToLower(strings.TrimSpace(r.Email))
}

func (r *ResendVerifyEmailRequest) Validate() error {
	if r.Email == "" {
		return errors.New("email wajib diisi")
	}
	if _, err := mail.ParseAddress(r.Email); err != nil {
		return errors.New("format email tidak valid")
	}
	return nil
}
