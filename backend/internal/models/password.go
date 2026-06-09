package models

import (
	"errors"
	"strings"

	"pendaftaran-uib/backend/internal/utils"
)

type  ChangePasswordRequest struct {
	OldPassword string `json:"old_password" validate:"required,min=8,max=128"`
	NewPassword string `json:"new_password" validate:"required,min=8,max=128,nefield=OldPassword"`
}

func (r *ChangePasswordRequest) Validate(lang string) error {
	return utils.ValidateStruct(r, lang)
}

type ForgotPasswordRequest struct {
	Email string `json:"email" validate:"required,email"`
	TurnstileToken string `json:"cf_turnstile_token" validate:"-"`
}

func (r *ForgotPasswordRequest) Sanitize() {
	r.Email = strings.ToLower(strings.TrimSpace(r.Email))
}

func (r *ForgotPasswordRequest) Validate(lang string) error {
	return utils.ValidateStruct(r, lang)
}

// ResetPasswordRequest — Token uses a deliberate vague message for security
type ResetPasswordRequest struct {
	Token       string `json:"token" validate:"-"`
	NewPassword string `json:"new_password" validate:"required,min=8,max=128"`
}

func (r *ResetPasswordRequest) Validate(lang string) error {
	if r.Token == "" {
		return errors.New("link sudah tidak valid atau sudah kedaluwarsa")
	}
	return utils.ValidateStruct(r, lang)
}
