package models

import (
	"time"

	"github.com/google/uuid"
)

type ProdiChangeRequest struct {
	ID                     uuid.UUID  `json:"id"`
	RegistrationID         uuid.UUID  `json:"registration_id"`
	PreviousProgramStudiID uuid.UUID  `json:"previous_program_studi_id"`
	NewProgramStudiID      uuid.UUID  `json:"new_program_studi_id"`
	PreviousClassSession   string     `json:"previous_class_session"`
	NewClassSession        string     `json:"new_class_session"`
	Status                 string     `json:"status"`
	Notes                  *string    `json:"notes"`
	CreatedAt              time.Time  `json:"created_at"`
	UpdatedAt              time.Time  `json:"updated_at"`
}

type ProdiChangeRequestDTO struct {
	ID                      uuid.UUID `json:"id"`
	RegistrationID          uuid.UUID `json:"registration_id"`
	PreviousProgramStudi    string    `json:"previous_program_studi"`
	NewProgramStudi         string    `json:"new_program_studi"`
	PreviousClassSession    string    `json:"previous_class_session"`
	NewClassSession         string    `json:"new_class_session"`
	Status                  string    `json:"status"`
	Notes                   *string   `json:"notes"`
	CreatedAt               string    `json:"created_at"`
	UpdatedAt               string    `json:"updated_at"`
}

type CreateProdiChangeRequest struct {
	RegistrationID    uuid.UUID `json:"registration_id" validate:"required"`
	NewProgramStudiID uuid.UUID `json:"new_program_studi_id" validate:"required"`
	NewClassSession   string    `json:"new_class_session" validate:"required,oneof=pagi malam"`
}
