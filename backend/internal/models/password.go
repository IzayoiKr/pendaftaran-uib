package models

import (
	"errors"
	"net/mail"
	"pendaftaran-uib/backend/internal/utils"
	"strings"
)

type  ChangePasswordRequest struct {
	OldPassword string `json:"old_password"`
	NewPassword string `json:"new_password"`
}

func (r *ChangePasswordRequest) Validate() error {
	switch {
	case r.OldPassword == "" || r.NewPassword == "":
		return errors.New("password lama dan baru harus diisi")
	case len(r.NewPassword) < 8:
		return errors.New("password baru minimal 8 karakter")
	case len(r.NewPassword) > 72:
		return errors.New("password baru terlalu panjang")
	case r.OldPassword == r.NewPassword:
		return errors.New("password baru harus berbeda dari password lama")
	}
	return nil
}

type ForgotPasswordRequest struct {
	Email string `json:"email"`
	NIK   string `json:"nik"`
	TurnstileToken string `json:"cf_turnstile_token"`
}

func (r *ForgotPasswordRequest) Sanitize() {
	r.Email = strings.ToLower(strings.TrimSpace(r.Email))
}

func (r *ForgotPasswordRequest) Validate() error {
	switch {
	case r.Email == "" || r.NIK == "":
		return errors.New("email dan NIK harus diisi")
	case len(r.NIK) != 16:
		return errors.New("NIK harus 16 digit")
	case !utils.IsAllDigits(r.NIK):
		return errors.New("NIK harus berupa angka")
	}

	if _, err := mail.ParseAddress(r.Email); err != nil {
		return errors.New("format email tidak valid")
	}

	return nil
}

type ResetPasswordRequest struct {
	Token       string `json:"token"`
	NewPassword string `json:"new_password"`
}

func (r *ResetPasswordRequest) Validate() error {
	switch {
	case r.Token == "":
		return errors.New("link tidak valid")
	case r.NewPassword == "":
		return errors.New("password harus diisi")
	case len(r.NewPassword) < 8:
		return errors.New("password minimal 8 karakter")
	case len(r.NewPassword) > 72:
		return errors.New("password tidak terlalu panjang")
	}
	return nil
}
