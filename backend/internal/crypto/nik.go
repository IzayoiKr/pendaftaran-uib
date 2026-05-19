package crypto

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"fmt"
	"io"
	"os"
	"strings"
	"sync"
)

var (
	encKey []byte
	blindKey []byte
	gcmAEAD cipher.AEAD
	initOnce sync.Once
	initErr error
)

func InitNIKCrypto() error {
	initOnce.Do(func() {
		encKey, initErr = loadKey("NIK_ENCRYPTION_KEY", 32)
		if initErr != nil {
			return
		}

		blindKey, initErr = loadKey("NIK_BLIND_INDEX_KEY", 32)
		if initErr != nil {
			return
		}

		block, err := aes.NewCipher(encKey)
		if err != nil {
			initErr = fmt.Errorf("aes cipher: %w", err)
			return
		}
		gcmAEAD, initErr = cipher.NewGCM(block)
		if initErr != nil {
			initErr = fmt.Errorf("gcm: %w", initErr)
		}
	})

	return initErr
}

func EncryptNIK(plain string) (string, error) {
	if gcmAEAD == nil {
		return "", fmt.Errorf("NIK crypto not initialized")
	}

	ns := gcmAEAD.NonceSize()
	dst := make([]byte, ns, ns+len(plain)+gcmAEAD.Overhead())
	if _, err := io.ReadFull(rand.Reader, dst[:ns]); err != nil {
		return "", fmt.Errorf("nonce: %w", err)
	}

	out := gcmAEAD.Seal(dst[:ns], dst[:ns], []byte(plain), nil)
	return "enc:" + base64.StdEncoding.EncodeToString(out), nil
}

func DecryptNIK(encrypted string) (string, error) {
	if gcmAEAD == nil {
		return "", fmt.Errorf("NIK crypto not initialized")
	}
	if !strings.HasPrefix(encrypted, "enc:") {
		return "", fmt.Errorf("not an encrypted value")
	}

	data, err := base64.StdEncoding.DecodeString(encrypted[4:])
	if err != nil {
		return "", fmt.Errorf("decode: %w", err)
	}

	ns := gcmAEAD.NonceSize()
	if len(data) < ns {
		return "", fmt.Errorf("ciphertext too short")
	}

	plain, err := gcmAEAD.Open(nil, data[:ns], data[ns:], nil)
	if err != nil {
		return "", fmt.Errorf("decrypt: %w", err)
	}
	return string(plain), nil
}

func NIKBlindIndex(plain string) (string, error) {
	if blindKey == nil {
		return "", fmt.Errorf("NIK crypto not initialized")
	}

	mac := hmac.New(sha256.New, blindKey)
	_, _ = io.WriteString(mac, plain)
	return hex.EncodeToString(mac.Sum(nil)), nil
}

func MaskNIK(plain string) string {
	n := len(plain)
	if n <= 4 {
		return plain
	}

	buf := make([]byte, n)
	for i := 0; i < n-4; i++ {
		buf[i] = '*'
	}

	copy(buf[n-4:], plain[n-4:])
	return string(buf)
}

func IsEncrypted(s string) bool {
	return strings.HasPrefix(s, "enc:")
}

func CompareBlindIndex(a, b string) bool {
	return hmac.Equal([]byte(a), []byte(b))
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
