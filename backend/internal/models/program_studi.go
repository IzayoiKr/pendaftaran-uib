package models

import "github.com/google/uuid"

type ProgramStudiDTO struct {
	ID uuid.UUID `json:"id"`
	Title string `json:"title"`
	Faculty string `json:"faculty"`
	Degree string `json:"degree"`
	Description string `json:"description"`
	ImagePath string `json:"image_path"`
	Link string `json:"link"`
}
