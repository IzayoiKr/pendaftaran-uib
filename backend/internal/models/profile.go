package models

import (
	"errors"
	"strings"
)

type UpdateProfileRequest struct {
	FullName string `json:"full_name"`
}

func (r *UpdateProfileRequest) Sanitize() {
	r.FullName = strings.TrimSpace(r.FullName)
}

func (r *UpdateProfileRequest) Validate() error {
	switch {
	case r.FullName == "":
		return errors.New("nama wajib diisi")
	case len(r.FullName) > 255:
		return errors.New("nama terlalu panjang")
	}
	return nil
}
