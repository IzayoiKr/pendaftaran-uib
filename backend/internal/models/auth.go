package models

type LoginRequest struct {
	Email string `json:"email"`
	Password string `json:"password"`
	TurnstileToken string `json:"cf_turnstile_token,omitempty"`
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
