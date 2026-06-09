package auth

import (
	"errors"
	"pendaftaran-uib/backend/internal/utils"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

const AccessTokenTTL = 15 * time.Minute
const RefreshTokenTTL = 12 * time.Hour

type TokenType string

const (
	TokenTypeAccess TokenType = "access"
	TokenTypeRefresh TokenType = "refresh"
)

type Claims struct {
	SessionID string `json:"session_id"`
	TokenType TokenType `json:"token_type"`
	jwt.RegisteredClaims
}

func GenerateAccessToken(userID, sessionID string) (string, error) {
	return generateToken(userID, sessionID, TokenTypeAccess, AccessTokenTTL)
}

func GenerateRefreshToken(userID, sessionID string) (string, error) {
	return generateToken(userID, sessionID, TokenTypeRefresh, RefreshTokenTTL)
}

func ValidateToken(raw string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(
		raw,
		&Claims{},
		func(t *jwt.Token) (any, error) {
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, errors.New("unexpected signing method")
			}
			return jwtSecret, nil
		},
		jwt.WithValidMethods([]string{"HS256"}),
		jwt.WithIssuer(jwtIssuer),
		jwt.WithExpirationRequired(),
	)
	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid token claims")
	}
	return claims, nil
}

func generateToken(userID, sessionID string, tokenType TokenType, ttl time.Duration) (string , error) {
	claims := Claims{
		SessionID: sessionID,
		TokenType: tokenType,
		RegisteredClaims: jwt.RegisteredClaims{
			ID: utils.GenerateUUIDString(),
			Subject: userID,
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(ttl)),
			IssuedAt: jwt.NewNumericDate(time.Now()),
			Issuer: jwtIssuer,
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}
