package auth

import (
	"context"
	"errors"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// ── Claims ─────────────────────────────────────────────────────────────────

// Claims extends the standard JWT claims with application-specific fields.
// JTI (JWT ID) is a unique identifier per token used for blacklisting.
type Claims struct {
	UserID   int    `json:"user_id"`
	Username string `json:"username"`
	JTI      string `json:"jti"`
	jwt.RegisteredClaims
}

// ── Token Store (MongoDB blacklist) ────────────────────────────────────────

// BlacklistedToken represents a revoked JWT stored in MongoDB.
// The expires_at field is used by a MongoDB TTL index to auto-delete
// documents once the original token would have expired anyway.
type BlacklistedToken struct {
	JTI       string    `bson:"jti"`
	ExpiresAt time.Time `bson:"expires_at"`
	CreatedAt time.Time `bson:"created_at"`
}

// TokenStore manages the JWT blacklist in MongoDB.
type TokenStore struct {
	col *mongo.Collection
}

// NewTokenStore returns a TokenStore backed by the given MongoDB database.
func NewTokenStore(db *mongo.Database) *TokenStore {
	return &TokenStore{col: db.Collection("token_blacklist")}
}

// EnsureIndexes creates the required MongoDB indexes (idempotent).
//
//   - TTL index on expires_at  → MongoDB auto-removes expired entries
//   - Unique index on jti       → fast O(1) blacklist lookups
func (ts *TokenStore) EnsureIndexes(ctx context.Context) error {
	_, err := ts.col.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{
			Keys:    bson.D{{Key: "expires_at", Value: 1}},
			Options: options.Index().SetExpireAfterSeconds(0),
		},
		{
			Keys:    bson.D{{Key: "jti", Value: 1}},
			Options: options.Index().SetUnique(true),
		},
	})
	return err
}

// BlacklistToken adds a token's JTI to the blacklist.
// Called on logout; MongoDB will delete the document automatically once
// expiresAt passes (via the TTL index).
func (ts *TokenStore) BlacklistToken(ctx context.Context, jti string, expiresAt time.Time) error {
	_, err := ts.col.InsertOne(ctx, BlacklistedToken{
		JTI:       jti,
		ExpiresAt: expiresAt,
		CreatedAt: time.Now(),
	})
	return err
}

// IsBlacklisted returns true when the given JTI is found in the blacklist.
func (ts *TokenStore) IsBlacklisted(ctx context.Context, jti string) (bool, error) {
	err := ts.col.FindOne(ctx, bson.M{"jti": jti}).Err()
	if errors.Is(err, mongo.ErrNoDocuments) {
		return false, nil
	}
	if err != nil {
		return false, err
	}
	return true, nil
}

// ── Token generation / parsing ─────────────────────────────────────────────

func jwtSecret() []byte {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "fallback-secret-change-this"
	}
	return []byte(secret)
}

// GenerateToken creates a signed JWT for the given user.
// Returns the signed string and the parsed Claims (so the caller can
// access JTI / expiry without a second parse).
func GenerateToken(userID int, username string) (string, *Claims, error) {
	expiresAt := time.Now().Add(24 * time.Hour)

	claims := &Claims{
		UserID:   userID,
		Username: username,
		JTI:      primitive.NewObjectID().Hex(), // unique per token
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expiresAt),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString(jwtSecret())
	if err != nil {
		return "", nil, err
	}
	return signed, claims, nil
}

// ParseToken validates a JWT string and returns its Claims.
func ParseToken(tokenStr string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &Claims{}, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return jwtSecret(), nil
	})
	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid token")
	}
	return claims, nil
}
