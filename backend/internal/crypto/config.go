package crypto

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"os"
	"strconv"
	"sync"

	"golang.org/x/crypto/bcrypt"
)

const pbkdf2Iterations = 100_000

var (
	bcryptCost int
	pepperKey []byte
	encKey []byte
	blindKey []byte
	blindSalt []byte
	gcmAEAD   cipher.AEAD
	initOnce  sync.Once
	initErr   error
)

func InitCrypto() error {
	initOnce.Do(func() {
		bcryptCostVar := os.Getenv("BCRYPT_COST")
		if bcryptCostVar == "" {
			initErr = fmt.Errorf("BCRYPT_COST not set (explicit configuration required)")
			return
		}
		cost, err := strconv.Atoi(bcryptCostVar)
		if err != nil || cost < bcrypt.MinCost || cost > bcrypt.MaxCost {
			initErr = fmt.Errorf("BCRYPT_COST must be an integer between %d and %d", bcrypt.MinCost, bcrypt.MaxCost)
			return
		}
		bcryptCost = cost

		pepperKey, initErr = loadKey("PEPPER_KEY", 32)
		if initErr != nil {
			return
		}

		encKey, initErr = loadKey("CRYPTO_AES_KEY", 32)
		if initErr != nil {
			return
		}

		blindKey, initErr = loadKey("NIK_BLIND_INDEX_KEY", 32)
		if initErr != nil {
			return
		}

		mac := hmac.New(sha256.New, blindKey)
		_, _ = mac.Write([]byte("nik-blind-index-v1"))
		blindSalt = mac.Sum(nil)

		block, err := aes.NewCipher(encKey)
		if err != nil {
			initErr = fmt.Errorf("aes cipher: %w", err)
			return
		}
		gcmAEAD, err = cipher.NewGCM(block)
		if err != nil {
			initErr = fmt.Errorf("gcm: %w", err)
			return
		}
	})
	return initErr
}

func loadKey(name string, size int) ([]byte, error) {
	raw := os.Getenv(name)
	if raw == "" {
		return nil, fmt.Errorf("%s not set", name)
	}

	key, err := hex.DecodeString(raw)
	if err != nil {
		return nil, fmt.Errorf("%s: invalid hex: %w", name, err)
	}
	if len(key) != size {
		return nil, fmt.Errorf("%s must be %d bytes (%d hex chars), got %d",
			name, size, size*2, len(key))
	}

	return key, nil
}
