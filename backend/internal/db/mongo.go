package db

import (
	"context"
	"fmt"
	"log/slog"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
)

func NewMongo(ctx context.Context, cfg MongoConfig) (*mongo.Client, *mongo.Database, error) {
	clientOpts := options.Client().
		ApplyURI(cfg.URI).
		SetConnectTimeout(cfg.ConnectTimeout).
		SetServerAPIOptions(options.ServerAPI(options.ServerAPIVersion1)).
		SetRetryWrites(true).
		SetReadPreference(readpref.Primary())

	client, err := mongo.Connect(ctx, clientOpts)
	if err != nil {
		return nil, nil, fmt.Errorf("mongo connect: %w", err)
	}

	pingCtx, cancel := context.WithTimeout(ctx, cfg.PingTimeout)
	defer cancel()

	if err := client.Ping(pingCtx, readpref.Primary()); err != nil {
		if discErr := client.Disconnect(ctx); discErr != nil {
			slog.Error("failed to disconnect mongo connection after failed ping", "error", discErr)
		}
		return nil, nil, fmt.Errorf("mongo ping: %w", err)
	}

	return client, client.Database(cfg.DBName), nil
}
