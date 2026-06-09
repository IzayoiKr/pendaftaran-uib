package db

import (
	"context"
	"database/sql"
	"fmt"
	"log/slog"

	_ "github.com/go-sql-driver/mysql"
)

func NewMySQL(ctx context.Context, cfg MySQLConfig) (*sql.DB, error) {
	dsn := fmt.Sprintf(
		"%s:%s@tcp(%s:%d)/%s?parseTime=true&collation=utf8mb4_0900_ai_ci&timeout=%ds&readTimeout=%ds&writeTimeout=%ds",
		cfg.User,
		cfg.Password,
		cfg.Host,
		cfg.Port,
		cfg.DBName,
		cfg.TCPTimeout,
		cfg.ReadTimeout,
		cfg.WriteTimeout,
	)

	conn, err := sql.Open("mysql", dsn)
	if err != nil {
		return nil, fmt.Errorf("mysql open: %w", err)
	}

	conn.SetMaxOpenConns(cfg.MaxOpenConns)
	conn.SetMaxIdleConns(cfg.MaxIdleConns)
	conn.SetConnMaxLifetime(cfg.MaxLifetime)
	conn.SetConnMaxIdleTime(cfg.MaxIdleTime)

	if err := conn.PingContext(ctx); err != nil {
		if closeErr := conn.Close(); closeErr != nil {
			slog.Error("failed to close mysql connection after failed ping", "error", closeErr)
		}
		return nil, fmt.Errorf("mysql ping: %w", err)
	}

	return conn, nil
}
