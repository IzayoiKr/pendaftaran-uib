package auth

import (
	"errors"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

const AccessTokenTTL = 15 * time.Minute
const RefreshTokenTTL = 12 * time.Hour

type TokenType string

const (
	TokenTypeAccess TokenType = "access"
	TokenTypeRefresh TokenType = "refresh"
)

type Claims struct {
	UserID string `json:"user_id"`
	Email string `json:"email"`
	SessionID string `json:"session_id"`
	TokenType TokenType `json:"token_type"`
	jwt.RegisteredClaims
}

func GenerateAccessToken(userID, sessionID, email string) (string, error) {
	return generateToken(userID, sessionID, email, TokenTypeAccess, AccessTokenTTL)
}

func GenerateRefreshToken(userID, sessionID, email string) (string, error) {
	return generateToken(userID, sessionID, email, TokenTypeRefresh, RefreshTokenTTL)
}

func ValidateToken(raw string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(raw, &Claims{}, func(t *jwt.Token) (any, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return getJWTSecret(), nil
	})
	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid token claims")
	}
	return claims, nil
}

func getJWTSecret() []byte {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		panic("JWT_SECRET environment variable is required")
	}
	return []byte(secret)

}

func generateToken(userID, sessionID, email string, tokenType TokenType, ttl time.Duration) (string , error) {
	issuer := os.Getenv("JWT_ISSUER")
	if issuer == "" {
		issuer = "pendaftaran-uib"
	}

	claims := Claims{
		UserID: userID,
		Email: email,
		SessionID: sessionID,
		TokenType: tokenType,
		RegisteredClaims: jwt.RegisteredClaims{
			ID: uuid.NewString(),
			Subject: userID,
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(ttl)),
			IssuedAt: jwt.NewNumericDate(time.Now()),
			Issuer: issuer,
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(getJWTSecret())
}
