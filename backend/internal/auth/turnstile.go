package auth

import (
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"net/url"
	"os"
	"strings"
)

type turnstileResponse struct {
	Success bool `json:"success"`
	Hostname string `json:"hostname"`
	ChallengeTS string `json:"challenge_ts"`
	ErrorCodes []string `json:"error-codes"`
}

func VerifyTurnstile(token, remoteIP string) (bool, error) {
	secret := os.Getenv("TURNSTILE_SECRET")
	if secret == "" {
		return false, fmt.Errorf("TURNSTILE_SECRET not set")
	}

	form := url.Values{}
	form.Set("secret", secret)
	form.Set("response", token)
	if remoteIP != "" {
		form.Set("remoteip", remoteIP)
	}

	resp, err := http.Post(
		"https://challenges.cloudflare.com/turnstile/v0/siteverify",
		"application/x-www-form-urlencoded",
		strings.NewReader(form.Encode()),
	)
	if err != nil {
		return false, fmt.Errorf("turnstile request failed: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return false, fmt.Errorf("reading turnstile response: %w", err)
	}

	var result turnstileResponse
	if err := json.Unmarshal(body, &result); err != nil {
		return false, fmt.Errorf("parsing turnstile response: %w", err)
	}

	if !result.Success {
		return false, nil
	}

	expectedHostname := os.Getenv("TURNSTILE_EXPECTED_HOSTNAME")
	if expectedHostname != "" && result.Hostname != expectedHostname {
		slog.Warn("SECURITY: Turnstile hostname mismatch - possible token replay",
			"expected", expectedHostname,
			"got", result.Hostname,
			"challenge_ts", result.ChallengeTS,
		)
		return false, nil
	}

	return true, nil
}
