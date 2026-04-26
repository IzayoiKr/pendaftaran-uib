package auth

import (
	"context"
	"errors"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type sessionDoc struct {
	SessionID string `bson:"session_id"`
	UserID string `bson:"user_id"`
	ExpiresAt time.Time `bson:"expires_at"`
}

type revokedToken struct {
	JTI string `bson:"jti"`
	UserID string `bson:"user_id"`
	ExpiresAt time.Time `bson:"expires_at"`
}

type TokenStore struct {
	sessions *mongo.Collection
	revokedTokens *mongo.Collection
}

func NewTokenStore(db *mongo.Database) (*TokenStore, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	sessions := db.Collection("sessions")
	if err := createSessionIndex(ctx, sessions); err != nil {
		return nil, err
	}

	revokedTokens := db.Collection("revoked_tokens")
	if err := createRevokedTokenIndex(ctx, revokedTokens); err != nil {
		return nil, err
	}

	return &TokenStore{
		sessions: sessions,
		revokedTokens: revokedTokens,
	}, nil
}

func createSessionIndex(ctx context.Context, col *mongo.Collection) error {
	index := []mongo.IndexModel{
		{
			Keys: bson.D{{Key: "expires_at", Value: 1}},
			Options: options.Index().SetExpireAfterSeconds(0).SetName("ttl_expires_at"),
		},
		{
			Keys: bson.D{{Key: "session_id", Value: 1}},
			Options: options.Index().SetUnique(true).SetName("unique_session_id"),
		},
		{
			Keys: bson.D{{Key: "user_id", Value: 1}},
			Options: options.Index().SetName("idx_user_id"),
		},
	}

	_, err := col.Indexes().CreateMany(ctx, index)
	return err
}

func createRevokedTokenIndex(ctx context.Context, col *mongo.Collection) error {
	index := []mongo.IndexModel{
		{
			Keys: bson.D{{Key: "expires_at", Value: 1}},
			Options: options.Index().SetExpireAfterSeconds(0).SetName("ttl_expires_at"),
		},
		{
			Keys: bson.D{{Key: "jti", Value: 1}},
			Options: options.Index().SetUnique(true).SetName("unique_jti"),
		},
	}

	_, err := col.Indexes().CreateMany(ctx, index)
	return err
}

func (ts *TokenStore) StoreSession(ctx context.Context, sessionID, userID string, expiresAt time.Time) error {
	_, err := ts.sessions.InsertOne(ctx, sessionDoc{
		SessionID: sessionID,
		UserID: userID,
		ExpiresAt: expiresAt,
	})
	return err
}

func (ts *TokenStore) IsSessionValid(ctx context.Context, sessionID string) (bool, error) {
	err := ts.sessions.FindOne(ctx, bson.M{"session_id": sessionID}).Err()
	if errors.Is(err, mongo.ErrNoDocuments) {
		return false, nil
	}
	if err != nil {
		return false, err
	}
	return true, nil
}

func (ts *TokenStore) RevokeSession(ctx context.Context, sessionID string) error {
	_, err := ts.sessions.DeleteOne(ctx, bson.M{"session_id": sessionID})
	return err
}

// Uncomment this if want log out all users feature
// func (ts *TokenStore) RevokeAllUserSessions(ctx context.Context, userID string) error {
// 	_, err := ts.sessions.DeleteMany(ctx, bson.M{"user_id": userID})
// 	return err
// }

func (ts *TokenStore) Revoke(ctx context.Context, claims *Claims) error {
	_, err := ts.revokedTokens.InsertOne(ctx, revokedToken{
		JTI: claims.ID,
		UserID: claims.UserID,
		ExpiresAt: claims.ExpiresAt.Time,
	})
	return err
}

func (ts *TokenStore) IsRevoked(ctx context.Context, jti string) (bool, error) {
	err := ts.revokedTokens.FindOne(ctx, bson.M{"jti": jti}).Err()
	if errors.Is(err, mongo.ErrNoDocuments) {
		return false, nil
	}
	if err != nil {
		return false, err
	}
	return true, nil
}
