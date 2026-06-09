package utils

import (
	"crypto/sha256"
	"encoding/hex"
)

func HashToken(raw string) string {
	h := sha256.Sum256([]byte(raw))
	return hex.EncodeToString(h[:])
}
