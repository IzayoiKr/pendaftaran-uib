package crypto

import (
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"io"
	"strings"

	"github.com/minio/sio"
)

func Encrypt(plaintext []byte) (string, error) {
	if gcmAEAD == nil {
		return "", fmt.Errorf("crypto not initialized")
	}
	ns := gcmAEAD.NonceSize()
	dst := make([]byte, ns, ns+len(plaintext)+gcmAEAD.Overhead())
	if _, err := io.ReadFull(rand.Reader, dst[:ns]); err != nil {
		return "", fmt.Errorf("nonce gen: %w", err)
	}
	ciphertext := gcmAEAD.Seal(dst[:ns], dst[:ns], plaintext, nil)
	return "enc:" + base64.StdEncoding.EncodeToString(ciphertext), nil
}

func Decrypt(encrypted string) ([]byte, error) {
	if gcmAEAD == nil {
		return nil, fmt.Errorf("crypto not initialized")
	}
	if !strings.HasPrefix(encrypted, "enc:") {
		return nil, fmt.Errorf("not an encrypted value")
	}

	data, err := base64.StdEncoding.DecodeString(encrypted[4:])
	if err != nil {
		return nil, fmt.Errorf("base64 decode: %w", err)
	}

	ns := gcmAEAD.NonceSize()
	if len(data) < ns {
		return nil, fmt.Errorf("ciphertext too short")
	}

	plaintext, err := gcmAEAD.Open(nil, data[:ns], data[ns:], nil)
	if err != nil {
		return nil, fmt.Errorf("aes-gcm decrypt failed: %w", err)
	}

	return plaintext, nil
}

func IsEncrypted(s string) bool {
	return strings.HasPrefix(s, "enc:")
}

func EncryptStream(src io.Reader, dst io.Writer) (err error) {
	if encKey == nil {
		return fmt.Errorf("encryption key not initialized")
	}

	config := sio.Config{
		MinVersion: sio.Version20,
		Key: encKey,
	}

	encryptedWriter, err := sio.EncryptWriter(dst, config)
	if err != nil {
		return fmt.Errorf("failed to initialize encryption writer: %w", err)
	}

	defer func() {
		if err != nil {
			_ = encryptedWriter.Close()
		}
	}()

	if _, err = io.Copy(encryptedWriter, src); err != nil {
		return fmt.Errorf("failed to commit encrypted file blocks: %w", err)
	}

	if err = encryptedWriter.Close(); err != nil {
		return fmt.Errorf("failed to flush final crypto blocks: %w", err)
	}

	return nil
}

func DecryptStream(src io.Reader, dst io.Writer) (err error) {
	if encKey == nil {
		return fmt.Errorf("encryption key not initialized")
	}

	config := sio.Config{
		MinVersion: sio.Version20,
		Key: encKey,
	}

	decryptedReader, err := sio.DecryptReader(src, config)
	if err != nil {
		return fmt.Errorf("failed to initialize decryption reader: %w", err)
	}

	if _, err = io.Copy(dst, decryptedReader); err != nil {
		return fmt.Errorf("decryption failed or malicious file tampering detected: %w", err)
	}

	return nil
}
