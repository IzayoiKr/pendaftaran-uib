package auth

import (
	"fmt"
	"os"
	"sync"
)

var (
	jwtSecretRaw string
	jwtSecret []byte
	jwtIssuer string
	turnstileSecret string
	turnstileExpectedHostname string
	initOnce sync.Once
	initErr error
)

func InitAuth() error {
	initOnce.Do(func() {
		jwtSecretRaw = os.Getenv("JWT_SECRET")
		if jwtSecretRaw == "" {
			initErr = fmt.Errorf("JWT_SECRET not set")
			return
		}
		jwtSecret = []byte(jwtSecretRaw)

		jwtIssuer = os.Getenv("JWT_ISSUER")
		if jwtIssuer == "" {
			initErr = fmt.Errorf("JWT_ISSUER not set")
			return
		}

		turnstileSecret = os.Getenv("TURNSTILE_SECRET")
		if turnstileSecret == "" {
			initErr = fmt.Errorf("TURNSTILE_SECRET not set")
			return
		}

		turnstileExpectedHostname = os.Getenv("TURNSTILE_EXPECTED_HOSTNAME")
		if turnstileExpectedHostname == "" {
			initErr = fmt.Errorf("TURNSTILE_EXPECTED_HOSTNAME not set")
			return
		}
	})
	return initErr
}
