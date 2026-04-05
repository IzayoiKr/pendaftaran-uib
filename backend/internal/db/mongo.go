package db

import (
	"context"
	"fmt"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func NewMongo(ctx context.Context) (*mongo.Client, string, error) {
	uri := os.Getenv("MONGO_URI")
	if uri == "" {
		return nil, "", fmt.Errorf("MongoDB missing required environment variable: MONGO_URI")
	}

	dbName := os.Getenv("MONGO_DB")
	if dbName == "" {
		return nil, "", fmt.Errorf("MongoDB missing required environment variable: MONGO_DB")
	}

	clientOpts := options.Client().ApplyURI(uri).SetConnectTimeout(10*time.Second)

	client, err := mongo.Connect(ctx, clientOpts)
	if err != nil {
		return nil, "", fmt.Errorf("mongo connect: %w", err)
	}

	pingCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	if err := client.Ping(pingCtx, nil); err != nil {
		return nil, "", fmt.Errorf("mongo ping: %w", err)
	}

	return client, dbName, nil
}
