package crypto

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"unsafe"
)

func NIKBlindIndex(plain string) (string, error) {
	if blindKey == nil {
		return "", fmt.Errorf("NIK crypto not initialized")
	}

	mac := hmac.New(sha256.New, blindKey)
	_, _ = mac.Write([]byte(plain))
	return hex.EncodeToString(mac.Sum(nil)), nil
}

func MaskNIK(b []byte) string {
	n := len(b)
	if n == 0 {
		return ""
	}
	if n <= 6 {
		return string(b)
	}

	for i := 6; i < n; i++ {
		b[i] = '*'
	}

	return unsafe.String(&b[0], len(b))
}

func CompareBlindIndex(a, b string) bool {
	return hmac.Equal([]byte(a), []byte(b))
}
