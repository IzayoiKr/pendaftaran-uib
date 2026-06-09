package db

import (
	"context"
	"database/sql"
	"log/slog"
	"time"
)

const cleanupInterval = 1 * time.Hour

type Cleaner struct {
	db *sql.DB
}

func NewCleaner(db *sql.DB) *Cleaner {
	return &Cleaner{db: db}
}

func (c *Cleaner) Start() {
	go c.run()
}

func (c *Cleaner) run() {
	ticker := time.NewTicker(cleanupInterval)
	defer ticker.Stop()
	for range ticker.C {
		c.sweep()
	}
}

func (c *Cleaner) sweep() {
	tables := []string{"reset_password", "email_verification"}
	for _, table := range tables {
		result, err := c.db.ExecContext(context.Background(),
			"DELETE FROM "+table+" WHERE expired_at < NOW()",
		)
		if err != nil {
			slog.Error("db cleaner: sweep failed", "table", table, "error", err)
			continue
		}
		if n, _ := result.RowsAffected(); n > 0 {
			slog.Info("db cleaner: remove expired rows", "table", table, "count", n)
		}
	}
}
