package handlers

import (
	"crypto/rand"
	"encoding/hex"
	"net/http"
	"os"
	"pendaftaran-uib/backend/internal/auth"
	"pendaftaran-uib/backend/internal/models"
	"pendaftaran-uib/backend/internal/utils"
	"time"
)

type accessTokenResponse struct {
	AccessToken string `json:"access_token"`
	User models.UserDTO `json:"user"`
}

const verifyTokenTTL = 24 * time.Hour
const resetTokenTTL = 15 * time.Minute

func generateVerificationToken() (rawToken, tokenHash string, err error) {
	b := make([]byte, 32)
	if _, err = rand.Read(b); err != nil {
		return "", "", err
	}
	rawToken = hex.EncodeToString(b)
	tokenHash = utils.HashToken(rawToken)
	return rawToken, tokenHash, nil
}

func setRefreshCookie(w http.ResponseWriter, refreshToken string) {
	http.SetCookie(w, &http.Cookie{
		Name: "refresh_token",
		Value: refreshToken,
		Path: "/api/auth",
		HttpOnly: true,
		Secure: isProduction(),
		SameSite: http.SameSiteStrictMode,
		MaxAge: int(auth.RefreshTokenTTL.Seconds()),
	})
}

func clearRefreshCookie(w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{
		Name:     "refresh_token",
		Value:    "",
		Path:     "/api/auth",
		HttpOnly: true,
		Secure: isProduction(),
		SameSite: http.SameSiteStrictMode,
		MaxAge:   -1,
	})
}

func isProduction() bool {
	return os.Getenv("APP_ENV") == "production"
}
