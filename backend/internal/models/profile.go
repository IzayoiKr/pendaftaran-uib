package models

import (
	"strings"

	"pendaftaran-uib/backend/internal/utils"
)

type UpdateProfileRequest struct {
	FullName string `json:"full_name" validate:"required,max=255"`
}

func (r *UpdateProfileRequest) Sanitize() {
	r.FullName = strings.TrimSpace(r.FullName)
}

func (r *UpdateProfileRequest) Validate() error {
	return utils.ValidateStruct(r)
}
