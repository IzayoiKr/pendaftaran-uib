package auth

import (
	"context"
	"errors"
	"time"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type revokedToken struct {
	JTI string `bson:"jti"`
	UserID string `bson:"user_id"`
	ExpiresAt time.Time `bson:"expires_at"`
}

type TokenStore struct {
	col *mongo.Collection
}

func NewTokenStore(db *mongo.Database) (*TokenStore, error) {
	col := db.Collection("revoked_tokens")

	indexModel := mongo.IndexModel{
		Keys: bson.D{{Key: "expires_at", Value: 1}},
		Options: options.Index().SetExpireAfterSeconds(0).SetName("ttl_expires_at"),
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if _, err := col.Indexes().CreateOne(ctx, indexModel); err != nil {
		return nil, err
	}

	jtiIndex := mongo.IndexModel{
		Keys: bson.D{{Key: "jti", Value: 1}},
		Options: options.Index().SetUnique(true).SetName("unique_jti"),
	}
	if _, err := col.Indexes().CreateOne(ctx, jtiIndex); err != nil {
		return nil, err
	}

	return &TokenStore{col: col}, nil
}

func (ts *TokenStore) Revoke(ctx context.Context, claims *Claims) error {
	doc := revokedToken{
		JTI: claims.ID,
		UserID: claims.UserID,
		ExpiresAt: claims.ExpiresAt.Time,
	}
	_, err := ts.col.InsertOne(ctx, doc)
	return err
}

func (ts *TokenStore) IsRevoked(ctx context.Context, jti string) (bool, error) {
	err := ts.col.FindOne(ctx, bson.M{"jti": jti}).Err()
	if errors.Is(err, mongo.ErrNoDocuments) {
		return false, err
	}
	if err != nil {
		return false, err
	}
	return true, nil
}
