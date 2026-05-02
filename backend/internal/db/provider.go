package db

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/readpref"
)

type Provider struct {
	MySQL *sql.DB
	Mongo *mongo.Database

	mongoClient *mongo.Client
}

func NewProvider(ctx context.Context) (*Provider, error) {
	cfg, err := LoadConfig()
	if err != nil {
		return nil, fmt.Errorf("load db config: %w", err)
	}

	mysql, err := NewMySQL(ctx, cfg.MySQL)
	if err != nil {
		return nil, fmt.Errorf("init mysql: %w", err)
	}

	mongoClient, mongoDB, err := NewMongo(ctx, cfg.Mongo)
	if err != nil {
		if closeErr := mysql.Close(); closeErr != nil {
			slog.Error("failed to close mysql after mongo error", "error", closeErr)
		}
		return nil, fmt.Errorf("init mongo: %w", err)
	}

	return &Provider{
		MySQL: mysql,
		Mongo: mongoDB,

		mongoClient: mongoClient,
	}, nil
}

func (p *Provider) Close(ctx context.Context) error {
	var errs []error

	if err := p.MySQL.Close(); err != nil {
		errs = append(errs, fmt.Errorf("mysql close: %w", err))
	}

	if err := p.mongoClient.Disconnect(ctx); err != nil {
		errs = append(errs, fmt.Errorf("mongo disconnect: %w", err))
	}

	return errors.Join(errs...)
}

func (p *Provider) PingCheck(ctx context.Context) (mysqlOK, mongoOK bool) {
	{
		ctx, cancel := context.WithTimeout(ctx, 2*time.Second)
		defer cancel()
		if err := p.MySQL.PingContext(ctx); err != nil {
			slog.Error("healthcheck mysql ping failed", "error", err)
			mysqlOK = false
		} else {
			mysqlOK = true
		}
	}
	{
		ctx, cancel := context.WithTimeout(ctx, 2*time.Second)
		defer cancel()
		if err := p.mongoClient.Ping(ctx, readpref.Primary()); err != nil {
			slog.Error("healthcheck mongo ping failed", "error", err)
			mongoOK = false
		} else {
			mongoOK = true
		}
	}
	return
}
