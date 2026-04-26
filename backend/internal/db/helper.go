package db

import (
	"os"
	"strconv"
)

func getEnvAsInt(name string, defaultVal int) int {
	if v, err := strconv.Atoi(os.Getenv(name)); err == nil {
		return v
	}
	return defaultVal
}
