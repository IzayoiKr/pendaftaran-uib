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
	ID string `json:"id"`
	FullName string `json:"full_name"`
	NIK string `json:"nik"`
	Email string `json:"email"`
}

func (u *User) ToDTO() UserDTO {
	return UserDTO {
		ID: u.ID,
		FullName: u.FullName,
		NIK: u.NIK,
		Email: u.Email,
	}
}
