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
	TCPTimeout int
	ReadTimeout int
	WriteTimeout int
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

	mysqlPortStr := req("DB_PORT")
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

	port, err := strconv.Atoi(mysqlPortStr)
	if err != nil {
		return nil, fmt.Errorf("DB_PORT must be a valid integer, got %q: %w", mysqlPortStr, err)
	}
	cfg.MySQL.Port = port

	cfg.MySQL.TCPTimeout = envInt("DB_TCP_TIMEOUT", 5)
	cfg.MySQL.ReadTimeout = envInt("DB_READ_TIMEOUT", 30)
	cfg.MySQL.WriteTimeout = envInt("DB_WRITE_TIMEOUT", 30)
	cfg.MySQL.MaxOpenConns = envInt("DB_MAX_OPEN_CONNS", 100)
	cfg.MySQL.MaxIdleConns = envInt("DB_MAX_IDLE_CONNS", 25)
	cfg.MySQL.MaxLifetime = time.Duration(envInt("DB_MAX_LIFETIME_MIN", 30)) * time.Minute
	cfg.MySQL.MaxIdleTime = time.Duration(envInt("DB_MAX_IDLE_LIFETIME_MIN", 5)) * time.Minute

	cfg.Mongo.ConnectTimeout = time.Duration(envInt("MONGO_CONNECT_TIMEOUT", 15)) * time.Second
	cfg.Mongo.PingTimeout = time.Duration(envInt("MONGO_PING_TIMEOUT", 5)) * time.Second

	return cfg, nil
}

func envInt(name string, defaultVal int) int {
	if v, err := strconv.Atoi(os.Getenv(name)); err == nil {
		return v
	}
	return defaultVal
}
