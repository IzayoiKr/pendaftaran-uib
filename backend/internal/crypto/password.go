package crypto

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"fmt"
	"io"
	"sync"

	"golang.org/x/crypto/bcrypt"
)

var (
	pepperKey []byte
	pepperInitOnce sync.Once
	pepperInitErr error
)

func InitPasswordPepper() error {
	pepperInitOnce.Do(func() {
		pepperKey, pepperInitErr = loadKey("PEPPER_KEY", 32)
	})
	return pepperInitErr
}

func pepperedInput(password string) (string, error) {
	if pepperKey == nil {
		return "", fmt.Errorf("password pepper not initialized")
	}
	mac := hmac.New(sha256.New, pepperKey)
	_, _ = io.WriteString(mac, password)
	return base64.StdEncoding.EncodeToString(mac.Sum(nil)), nil
}

func HashPassword(password string) (string, error) {
	peppered, err := pepperedInput(password)
	if err != nil {
		return "", err
	}
	b, err := bcrypt.GenerateFromPassword([]byte(peppered), bcrypt.DefaultCost)
	return string(b), err
}

func VerifyPassword(hashedPassword, password string) error {
	peppered, err := pepperedInput(password)
	if err != nil {
		return err
	}
	return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(peppered))
}
