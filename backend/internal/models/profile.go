package models

import (
	"errors"
	"strings"
	"unicode/utf8"
)

type UpdateProfileRequest struct {
	FullName string `json:"full_name"`
}

func (r *UpdateProfileRequest) Sanitize() {
	r.FullName = strings.TrimSpace(r.FullName)
}

func (r *UpdateProfileRequest) Validate() error {
	if r.FullName == "" {
		return errors.New("nama wajib diisi")
	}
	if utf8.RuneCountInString(r.FullName) > 255 {
		return errors.New("nama terlalu panjang")
	}
	return nil
}
