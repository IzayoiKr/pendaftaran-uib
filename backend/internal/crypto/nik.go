package crypto

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"

	"golang.org/x/crypto/pbkdf2"
)

func NIKBlindIndex(plain string) (string, error) {
	if blindKey == nil || blindSalt == nil {
		return "", fmt.Errorf("NIK crypto not initialized")
	}

	dk := pbkdf2.Key([]byte(plain), blindSalt, pbkdf2Iterations, 32, sha256.New)
	return hex.EncodeToString(dk), nil
}

func MaskNIK(b []byte) string {
	n := len(b)
	if n == 0 {
		return ""
	}
	return "********************"[:n]
}

func CompareBlindIndex(a, b string) bool {
	return hmac.Equal([]byte(a), []byte(b))
}
