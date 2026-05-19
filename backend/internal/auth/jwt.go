package auth

import (
	"errors"
	"fmt"
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
	UserID string `json:"user_id"`
	Email string `json:"email"`
	SessionID string `json:"session_id"`
	TokenType TokenType `json:"token_type"`
	jwt.RegisteredClaims
}

var jwtCfg struct {
	secret []byte
	issuer string
}

func InitJWT(secret, issuer string) error {
	if secret == "" {
		return fmt.Errorf("JWT_SECRET is required")
	}
	if issuer == "" {
		return fmt.Errorf("JWT_ISSUER is required")
	}
	jwtCfg.secret = []byte(secret)
	jwtCfg.issuer = issuer
	return nil
}

func GenerateAccessToken(userID, sessionID, email string) (string, error) {
	return generateToken(userID, sessionID, email, TokenTypeAccess, AccessTokenTTL)
}

func GenerateRefreshToken(userID, sessionID, email string) (string, error) {
	return generateToken(userID, sessionID, email, TokenTypeRefresh, RefreshTokenTTL)
}

func ValidateToken(raw string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(
		raw,
		&Claims{},
		func(t *jwt.Token) (any, error) {
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, errors.New("unexpected signing method")
			}
			return jwtCfg.secret, nil
		},
		jwt.WithValidMethods([]string{"HS256"}),
		jwt.WithIssuer(jwtCfg.issuer),
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

func generateToken(userID, sessionID, email string, tokenType TokenType, ttl time.Duration) (string , error) {
	claims := Claims{
		UserID: userID,
		Email: email,
		SessionID: sessionID,
		TokenType: tokenType,
		RegisteredClaims: jwt.RegisteredClaims{
			ID: utils.GenerateUUIDString(),
			Subject: userID,
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(ttl)),
			IssuedAt: jwt.NewNumericDate(time.Now()),
			Issuer: jwtCfg.issuer,
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtCfg.secret)
}
