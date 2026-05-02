package models

type VerifyEmailRequest struct {
	Token string `json:"token"`
	TurnstileToken string `json:"cf_turnstile_token"`
}

type ResendVerifyEmailRequest struct {
	Email string `json:"email"`
}
