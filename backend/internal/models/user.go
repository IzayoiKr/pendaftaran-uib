package models

import "time"

type User struct {
	ID string
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

func (u *User) ToDTO() UserDTO {
	return UserDTO {
		FullName: u.FullName,
		NIK: u.NIK,
		Email: u.Email,
	}
}

type RegistrationDTO struct {
	NomorDaftar string `json:"nomorDaftar"`
	Periode     int    `json:"periode"`
	Gelombang   string `json:"gelombang"`
	Jurusan     string `json:"jurusan"`
	Biodata     string `json:"biodata"`
	Pembayaran  string `json:"pembayaran"`
}

type ProfileResponse struct {
	FullName      string            `json:"full_name"`
	NIK           string            `json:"nik"`
	Email         string            `json:"email"`
	Registrations []RegistrationDTO `json:"registrations"`
}
