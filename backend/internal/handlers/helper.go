package handlers

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"net/http"
	"os"
	"pendaftaran-uib/backend/internal/auth"
	"time"
)

const verifyTokenTTL = 24 * time.Hour
const resetTokenTTL = 15 * time.Minute

func generateVerificationToken() (rawToken, tokenHash string, err error) {
	b := make([]byte, 32)
	if _, err = rand.Read(b); err != nil {
		return "", "", err
	}
	rawToken = hex.EncodeToString(b)
	h := sha256.Sum256([]byte(rawToken))
	tokenHash = hex.EncodeToString(h[:])
	return rawToken, tokenHash, nil
}

func setRefreshCookie(w http.ResponseWriter, refreshToken string) {
	secure := os.Getenv("APP_ENV") == "production"
	http.SetCookie(w, &http.Cookie{
		Name: "refresh_token",
		Value: refreshToken,
		Path: "/api/auth",
		HttpOnly: true,
		Secure: secure,
		SameSite: http.SameSiteStrictMode,
		MaxAge: int(auth.RefreshTokenTTL.Seconds()),
	})
}

func clearRefreshCookie(w http.ResponseWriter) {
	secure := os.Getenv("APP_ENV") == "production"
	http.SetCookie(w, &http.Cookie{
		Name:     "refresh_token",
		Value:    "",
		Path:     "/api/auth",
		HttpOnly: true,
		Secure: secure,
		SameSite: http.SameSiteStrictMode,
		MaxAge:   -1,
	})
}
