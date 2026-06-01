package crypto

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"fmt"

	"golang.org/x/crypto/bcrypt"
)

func pepperedInput(password string) (string, error) {
	if pepperKey == nil {
		return "", fmt.Errorf("password pepper not initialized")
	}
	mac := hmac.New(sha256.New, pepperKey)
	_, _ = mac.Write([]byte(password))
	return base64.StdEncoding.EncodeToString(mac.Sum(nil)), nil
}

func HashPassword(password string) (string, error) {
	peppered, err := pepperedInput(password)
	if err != nil {
		return "", err
	}
	b, err := bcrypt.GenerateFromPassword([]byte(peppered), bcryptCost)
	return string(b), err
}

func VerifyPassword(hashedPassword, password string) error {
	peppered, err := pepperedInput(password)
	if err != nil {
		return err
	}
	return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(peppered))
}
