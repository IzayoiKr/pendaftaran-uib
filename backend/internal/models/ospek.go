package models

import (
	"time"

	"github.com/google/uuid"
)

type OspekPrerequisite struct {
	RegistrationID uuid.UUID  `json:"registration_id"`
	PasFotoPath    *string    `json:"pas_foto_path"`
	PasFotoName    *string    `json:"pas_foto_name"`
	IjazahPath     *string    `json:"ijazah_path"`
	IjazahName     *string    `json:"ijazah_name"`
	Status         string     `json:"status"`
	Notes          *string    `json:"notes"`
	UploadedAt     time.Time  `json:"uploaded_at"`
	VerifiedAt     *time.Time `json:"verified_at,omitempty"`
}

type OspekPrerequisiteDTO struct {
	RegistrationID   uuid.UUID `json:"registration_id"`
	FullName         string    `json:"full_name"`
	Email            string    `json:"email"`
	NIK              string    `json:"nik"`
	BatchName        string    `json:"batch_name"`
	StudyProgram     string    `json:"study_program"`
	AcademicYear     string    `json:"academic_year"`
	PasFotoName      *string   `json:"pas_foto_name"`
	IjazahName       *string   `json:"ijazah_name"`
	Status           string    `json:"status"`
	Notes            *string   `json:"notes"`
	UploadedAt       string    `json:"uploaded_at"`
	VerifiedAt       *string   `json:"verified_at,omitempty"`
}
