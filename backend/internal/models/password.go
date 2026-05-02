package models

type  ChangePasswordRequest struct {
	OldPassword string `json:"old_password"`
	NewPassword string `json:"new_password"`
}

type ForgotPasswordRequest struct {
	Email string `json:"email"`
	NIK   string `json:"nik"`
	TurnstileToken string `json:"cf_turnstile_token"`
}

type ResetPasswordRequest struct {
	Token       string `json:"token"`
	NewPassword string `json:"new_password"`
}
