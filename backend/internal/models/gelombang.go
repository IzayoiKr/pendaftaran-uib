package models

import "github.com/google/uuid"

type GelombangDTO struct {
	ID uuid.UUID `json:"id"`
	BatchKey string `json:"batch_key"`
	BatchName string `json:"batch_name"`
	Degree string `json:"degree"`
	BatchType string `json:"batch_type"`
	AcademicYear string `json:"academic_year"`
	ImagePath string `json:"image_path"`
	Day string `json:"day"`
	Month string `json:"month"`
	StartTime string `json:"start_time"`
	EndTime string `json:"end_time"`
	Location string `json:"location"`
	RegistrationStart string `json:"registration_start"`
	RegistrationStartDisplay string `json:"registration_start_display"`
	RegistrationEnd string `json:"registration_end"`
	RegistrationEndDisplay string `json:"registration_end_display"`
}
