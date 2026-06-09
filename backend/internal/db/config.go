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
	Host         string
	Port         int
	User         string
	Password     string
	DBName       string
	TCPTimeout   int
	ReadTimeout  int
	WriteTimeout int
	MaxOpenConns int
	MaxIdleConns int
	MaxLifetime  time.Duration
	MaxIdleTime  time.Duration
}

type MongoConfig struct {
	URI            string
	DBName         string
	ConnectTimeout time.Duration
	PingTimeout    time.Duration
}

func LoadConfig() (*Config, error) {
	var missing []string
	var parseErrors []string

	req := func(key string) string {
		v := os.Getenv(key)
		if v == "" {
			missing = append(missing, key)
		}
		return v
	}

	reqInt := func(key string) int {
		v := os.Getenv(key)
		if v == "" {
			missing = append(missing, key)
			return 0
		}
		i, err := strconv.Atoi(v)
		if err != nil {
			parseErrors = append(parseErrors, fmt.Sprintf("%s must be a valid integer, got %q", key, v))
			return 0
		}
		return i
	}

	mysqlHost := req("DB_HOST")
	mysqlPort := reqInt("DB_PORT")
	mysqlUser := req("DB_USER")
	mysqlPass := req("DB_PASSWORD")
	mysqlDBName := req("DB_NAME")

	tcpTimeout := reqInt("DB_TCP_TIMEOUT")
	readTimeout := reqInt("DB_READ_TIMEOUT")
	writeTimeout := reqInt("DB_WRITE_TIMEOUT")
	maxOpen := reqInt("DB_MAX_OPEN_CONNS")
	maxIdle := reqInt("DB_MAX_IDLE_CONNS")
	maxLifetimeMin := reqInt("DB_MAX_LIFETIME_MIN")
	maxIdleTimeMin := reqInt("DB_MAX_IDLE_LIFETIME_MIN")

	mongoURI := req("MONGO_URI")
	mongoDB := req("MONGO_DB")
	mongoConnectSec := reqInt("MONGO_CONNECT_TIMEOUT")
	mongoPingSec := reqInt("MONGO_PING_TIMEOUT")

	if len(missing) > 0 {
		return nil, fmt.Errorf("missing required environment variables: %v", missing)
	}

	if len(parseErrors) > 0 {
		return nil, fmt.Errorf("configuration parse errors: %v", parseErrors)
	}

	cfg := &Config{
		MySQL: MySQLConfig{
			Host:         mysqlHost,
			Port:         mysqlPort,
			User:         mysqlUser,
			Password:     mysqlPass,
			DBName:       mysqlDBName,
			TCPTimeout:   tcpTimeout,
			ReadTimeout:  readTimeout,
			WriteTimeout: writeTimeout,
			MaxOpenConns: maxOpen,
			MaxIdleConns: maxIdle,
			MaxLifetime:  time.Duration(maxLifetimeMin) * time.Minute,
			MaxIdleTime:  time.Duration(maxIdleTimeMin) * time.Minute,
		},
		Mongo: MongoConfig{
			URI:            mongoURI,
			DBName:         mongoDB,
			ConnectTimeout: time.Duration(mongoConnectSec) * time.Second,
			PingTimeout:    time.Duration(mongoPingSec) * time.Second,
		},
	}

	return cfg, nil
}
