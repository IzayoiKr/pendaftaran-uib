package models

import (
	"errors"
	"net/mail"
	"pendaftaran-uib/backend/internal/utils"
	"strings"
)

type LoginRequest struct {
	Email string `json:"email"`
	Password string `json:"password"`
	TurnstileToken string `json:"cf_turnstile_token,omitempty"`
}

func (r *LoginRequest) Sanitize() {
	r.Email = strings.ToLower(strings.TrimSpace(r.Email))
}

func (r *LoginRequest) Validate() error {
	switch {
	case r.Email == "":
		return errors.New("email dan password wajib diisi")
	case r.Password == "":
		return errors.New("email dan password wajib diisi")
	}
	return nil
}

type LoginErrorResponse struct {
	Error string `json:"error"`
	RequireCaptcha bool `json:"require_captcha,omitempty"`
}

type RegisterRequest struct {
	FullName string `json:"full_name"`
	NIK string `json:"nik"`
	Email string `json:"email"`
	Password string `json:"password"`
	TurnstileToken string `json:"cf_turnstile_token"`
}

func (r *RegisterRequest) Sanitize() {
	r.FullName = strings.TrimSpace(r.FullName)
	r.Email = strings.ToLower(strings.TrimSpace(r.Email))
}

func (r *RegisterRequest) Validate() error {
	switch {
	case r.FullName == "":
		return errors.New("nama wajib diisi")
	case len(r.FullName) > 255:
		return errors.New("nama terlalu panjang")
	case len(r.NIK) != 16:
		return errors.New("NIK harus 16 digit")
	case !utils.IsAllDigits(r.NIK):
		return errors.New("NIK harus berupa angka")
	case r.Email == "":
		return errors.New("email wajib diisi")
	case len(r.Password) < 8:
		return errors.New("password 8 minimal karakter")
	case len(r.Password) > 72:
		return errors.New("password terlalu panjang")
	}

	if _, err := mail.ParseAddress(r.Email); err != nil {
		return errors.New("format email tidak valid")
	}

	return nil
}
