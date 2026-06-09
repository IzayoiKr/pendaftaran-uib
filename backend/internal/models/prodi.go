package models

import (
	"strings"
)

type ProdiRequestItem struct {
	ID 			  uint64 `json:"id,string"`
	RequestDate   string `json:"request_date"`
	PreviousProdi string `json:"previous_prodi"`
	PreviousShift string `json:"previous_shift"`
	NewProdi      string `json:"new_prodi"`
	NewShift      string `json:"new_shift"`
	Status        string `json:"status"`
}

type ProdiInfoResponse struct {
	RegistrationID string             `json:"registration_id"`
	BatchName      string             `json:"batch_name"`
	AcademicYear   string             `json:"academic_year"`
	CurrentProdi   string             `json:"current_prodi"`
	CurrentShift   string             `json:"current_shift"`
	AvailablePrograms 	   []ProgramChoice 	  `json:"available_programs"`
	Requests       []ProdiRequestItem `json:"requests"`
}

type CreateProdiRequest struct {
	NewProdiCode string `json:"new_prodi" validate:"required"`
	NewShift   string `json:"new_shift" validate:"required,oneof=PAGI MALAM"`
}

func (r *CreateProdiRequest) Sanitize() {
	r.NewProdiCode = strings.TrimSpace(r.NewProdiCode)
	r.NewShift = strings.TrimSpace(r.NewShift)
}
