package db

import (
	"fmt"
	"os"
	"strconv"
	"time"
)

type Config struct {
	MySQL MySQLConfig
	Mongo MongoConfig
}

type MySQLConfig struct {
	Host string
	Port int
	User string
	Password string
	DBName string
	MaxOpenConns int
	MaxIdleConns int
	MaxLifetime time.Duration
	MaxIdleTime time.Duration
}

type MongoConfig struct {
	URI string
	DBName string
	ConnectTimeout time.Duration
	PingTimeout time.Duration
}

func LoadConfig() (*Config, error) {
	var missing []string

	req := func(key string) string {
		v := os.Getenv(key)
		if v == "" {
			missing = append(missing, key)
		}
		return v
	}

	cfg := &Config{
		MySQL: MySQLConfig{
			Host: req("DB_HOST"),
			User: req("DB_USER"),
			Password: req("DB_PASSWORD"),
			DBName: req("DB_NAME"),
		},
		Mongo: MongoConfig{
			URI: req("MONGO_URI"),
			DBName: req("MONGO_DB"),
		},
	}

	if len(missing) > 0 {
		return nil, fmt.Errorf("missing required environment variables: %v", missing)
	}

	portStr := os.Getenv("DB_PORT")
	if portStr == "" {
		return nil, fmt.Errorf("missing required environment variable: DB_PORT")
	}
	port, err := strconv.Atoi(portStr)
	if err != nil {
		return nil, fmt.Errorf("DB_PORT must be a valid integer, got %q: %w", portStr, err)
	}
	cfg.MySQL.Port = port

	cfg.MySQL.MaxOpenConns = getEnvAsInt("DB_MAX_OPEN_CONNS", 100)
	cfg.MySQL.MaxIdleConns = getEnvAsInt("DB_MAX_IDLE_CONNS", 25)
	cfg.MySQL.MaxLifetime = time.Duration(getEnvAsInt("DB_MAX_LIFETIME_MIN", 30) * int(time.Minute))
	cfg.MySQL.MaxIdleTime = time.Duration(getEnvAsInt("DB_MAX_IDLE_LIFETIME_MIN", 5) * int(time.Minute))

	cfg.Mongo.ConnectTimeout = time.Duration(getEnvAsInt("MONGO_CONNECT_TIMEOUT", 15) * int(time.Second))
	cfg.Mongo.PingTimeout = time.Duration(getEnvAsInt("MONGO_PING_TIMEOUT", 5) * int(time.Second))

	return cfg, nil
}
