package utils

import (
	"fmt"

	"github.com/google/uuid"
)

func GenerateUUIDBytes() []byte {
	u, err := uuid.NewV7()
	if err != nil {
		panic(fmt.Errorf("failed to generate uuid: %w", err))
	}
	return u[:]
}

func GenerateUUIDString() string {
	u, err := uuid.NewV7()
	if err != nil {
		panic(fmt.Errorf("failed to generate uuid: %w", err))
	}
	return u.String()
}

func UUIDFromBytes(b []byte) (string, error) {
	if len(b) != 16 {
		return "", fmt.Errorf("invalid binary uuid length: %d", len(b))
	}
	u, err := uuid.FromBytes(b)
	if err != nil {
		return "", fmt.Errorf("failed to parse bytes to uuid: %w", err)
	}
	return u.String(), nil
}

func UUIDToBytes(s string) ([]byte, error) {
	u, err := uuid.Parse(s)
	if err != nil {
		return nil, fmt.Errorf("invalid uuid: %w", err)
	}
	return u[:], nil
}
