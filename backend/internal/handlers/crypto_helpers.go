package handlers

import (
	"log/slog"
	nikCrypto "pendaftaran-uib/backend/internal/crypto"
)

func decryptAndMask(encryptedNIK string) string {
	plain, err := nikCrypto.DecryptNIK(encryptedNIK)
	if err != nil {
		slog.Error("NIK decrypt failed; returning placeholder", "error", err)
		return "****************"
	}
	return nikCrypto.MaskNIK(plain)
}
