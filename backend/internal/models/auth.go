package models

import (
	"strings"

	"pendaftaran-uib/backend/internal/utils"
)

type LoginRequest struct {
	Email string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=8,max=128"`
	TurnstileToken string `json:"cf_turnstile_token,omitempty" validate:"-"`
}

func (r *LoginRequest) Sanitize() {
	r.Email = strings.ToLower(strings.TrimSpace(r.Email))
}

func (r *LoginRequest) Validate() error {
	return utils.ValidateStruct(r)
}

type LoginErrorResponse struct {
	Error string `json:"error"`
	RequireCaptcha bool `json:"require_captcha,omitempty"`
}

type RegisterRequest struct {
	FullName string `json:"full_name" validate:"required,max=255"`
	NIK string `json:"nik" validate:"required,min=6,max=20,alphanum_ascii"`
	Email string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=8,max=128"`
	TurnstileToken string `json:"cf_turnstile_token" validate:"-"`
}

func (r *RegisterRequest) Sanitize() {
	r.FullName = strings.TrimSpace(r.FullName)
	r.NIK = strings.ToUpper(strings.TrimSpace(r.NIK))
	r.Email = strings.ToLower(strings.TrimSpace(r.Email))
}

func (r *RegisterRequest) Validate() error {
	return utils.ValidateStruct(r)
}
