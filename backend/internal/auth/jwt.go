package auth

import (
	"errors"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

const AccessTokenTTL = 15 * time.Minute
const RefreshTokenTTL = 24 * time.Hour

func getJWTSecret() []byte {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		panic("JWT_SECRET environment variable is required")
	}
	return []byte(secret)

}

type TokenType string

const (
	TokenTypeAccess TokenType = "access"
	TokenTypeRefresh TokenType = "refresh"
)

type Claims struct {
	UserID string `json:"user_id"`
	Email string `json:"email"`
	TokenType TokenType `json:"token_type"`
	jwt.RegisteredClaims
}

func GenerateAccessToken(userID, email string) (string, error) {
	return generateToken(userID, email, TokenTypeAccess, AccessTokenTTL)
}

func GenerateRefreshToken(userID, email string) (string, error) {
	return generateToken(userID, email, TokenTypeRefresh, RefreshTokenTTL)
}

func generateToken(userID, email string, tokenType TokenType, ttl time.Duration) (string , error) {
	claims := Claims{
		UserID: userID,
		Email: email,
		TokenType: tokenType,
		RegisteredClaims: jwt.RegisteredClaims{
			ID: uuid.NewString(),
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(ttl)),
			IssuedAt: jwt.NewNumericDate(time.Now()),
			Issuer: "pendaftaran-uib",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(getJWTSecret())
}

func Validatetoken(raw string) (*Claims, error) {
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
