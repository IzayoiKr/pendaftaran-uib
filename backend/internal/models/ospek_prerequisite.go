package models

import "time"

type OspekPrerequisite struct {
	RegistrationID string     `json:"registration_id"`
	PasFotoPath    *string    `json:"pas_foto_path,omitempty"`
	PasFotoName    *string    `json:"pas_foto_name,omitempty"`
	IjazahPath     *string    `json:"ijazah_path,omitempty"`
	IjazahName     *string    `json:"ijazah_name,omitempty"`
	Status         string     `json:"status"`
	Notes          *string    `json:"notes,omitempty"`
	UploadedAt     time.Time  `json:"uploaded_at"`
}
