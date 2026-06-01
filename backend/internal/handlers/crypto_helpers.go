package handlers

import (
	"log/slog"
	"pendaftaran-uib/backend/internal/crypto"
)

func decryptAndMask(encryptedNIK string) string {
	b, err := crypto.Decrypt(encryptedNIK)
	if err != nil {
		slog.Error("NIK decrypt failed; returning placeholder", "error", err)
		return "****************"
	}
	return crypto.MaskNIK(b)
}
