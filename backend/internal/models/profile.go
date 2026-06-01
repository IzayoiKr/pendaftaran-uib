package models

import (
	"html"
	"strings"

	"pendaftaran-uib/backend/internal/utils"
)

type ProfileDTO struct {
	UserDTO
	Registrations []RegistrationCardDTO `json:"registrations"`
}
 
type RegistrationCardDTO struct {
	RegistrationID string `json:"registration_id"`
	Status         string `json:"status"`
	BatchKey       string `json:"batch_key"`
	BatchName      string `json:"batch_name"`
	Degree         string `json:"degree"`
	BatchType      string `json:"batch_type"`
	AcademicYear   string `json:"academic_year"`
	EventDate      string `json:"event_date"`
	StartTime      string `json:"start_time"`
	RegistrationEnd string `json:"registration_end,omitempty"`
 
	FeedbackDocument *string `json:"feedback_document,omitempty"`
	FeedbackPayment  *string `json:"feedback_payment,omitempty"`
 
	ExamineeID  *string `json:"examinee_id,omitempty"`
	USMPassword *string `json:"usm_password,omitempty"`
}

type UpdateProfileRequest struct {
	FullName string `json:"full_name" validate:"required,max=255"`
}

func (r *UpdateProfileRequest) Sanitize() {
	r.FullName = html.EscapeString(strings.TrimSpace(r.FullName))
}

func (r *UpdateProfileRequest) Validate() error {
	return utils.ValidateStruct(r)
}
