package utils

import (
	"fmt"

	"github.com/google/uuid"
)

func NewUUID() uuid.UUID {
	u, err := uuid.NewV7()
	if err != nil {
		panic(fmt.Errorf("failed to generate uuid: %w", err))
	}
	return u
}

func GenerateUUIDString() string {
	u, err := uuid.NewV7()
	if err != nil {
		panic(fmt.Errorf("failed to generate uuid: %w", err))
	}
	return u.String()
}
