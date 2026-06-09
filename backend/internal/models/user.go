package models

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID uuid.UUID
	FullName string
	NIK string
	Email string
	PasswordHash string
	EmailVerified bool
	CreatedAt time.Time
	UpdatedAt time.Time
}

type UserDTO struct {
	FullName string `json:"full_name"`
	NIK string `json:"nik"`
	Email string `json:"email"`
}

func (u *User) ToDTO(maskedNIK string) UserDTO {
	return UserDTO {
		FullName: u.FullName,
		NIK: maskedNIK,
		Email: u.Email,
	}
}
