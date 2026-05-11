package utils

import (
	"github.com/google/uuid"
)

// GenerateUUID generates a new UUID v4 string
func GenerateUUID() string {
	return uuid.New().String()
}
