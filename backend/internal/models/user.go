package models

import "time"

type User struct {
	ID string
	FullName string
	NIK string
	Email string
	PasswordHash string
	CreatedAt time.Time
	UpdatedAt time.Time
}

type UserDTO struct {
	FullName string `json:"full_name"`
	NIK string `json:"nik"`
	Email string `json:"email"`
}

func (u *User) ToDTO() UserDTO {
	return UserDTO {
		FullName: u.FullName,
		NIK: u.NIK,
		Email: u.Email,
	}
}

type  ChangePasswordRequest struct {
	OldPassword string `json:"old_password"`
	NewPassword string `json:"new_password"`
}

type ForgotPasswordRequest struct {
	Email string `json:"email"`
	NIK   string `json:"nik"`
}

type ResetPasswordRequest struct {
	Token       string `json:"token"`
	NewPassword string `json:"new_password"`
}

