package auth

import (
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"net/url"
	"strings"
	"time"
)

var turnstileClient = &http.Client{Timeout: 5 * time.Second}

type turnstileResponse struct {
	Success bool `json:"success"`
	Hostname string `json:"hostname"`
	ChallengeTS string `json:"challenge_ts"`
	ErrorCodes []string `json:"error-codes"`
}

func VerifyTurnstile(token, remoteIP string) (bool, error) {
	if turnstileSecret == "" {
		return false, fmt.Errorf("turnstile key not initialized")
	}

	form := url.Values{}
	form.Set("secret", turnstileSecret)
	form.Set("response", token)
	if remoteIP != "" {
		form.Set("remoteip", remoteIP)
	}

	req, err := http.NewRequest(
		http.MethodPost,
		"https://challenges.cloudflare.com/turnstile/v0/siteverify",
		strings.NewReader(form.Encode()),
	)
	if err != nil {
		return false, fmt.Errorf("create turnstile request: %w", err)
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	resp, err := turnstileClient.Do(req)
	if err != nil {
		return false, fmt.Errorf("turnstile request failed: %w", err)
	}
	defer resp.Body.Close()

	var result turnstileResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return false, fmt.Errorf("parsing turnstile response: %w", err)
	}

	if !result.Success {
		return false, nil
	}

	if turnstileExpectedHostname != "" && result.Hostname != turnstileExpectedHostname {
		slog.Warn("SECURITY: Turnstile hostname mismatch - possible token replay",
			"expected", turnstileExpectedHostname,
			"got", result.Hostname,
			"challenge_ts", result.ChallengeTS,
		)
		return false, nil
	}

	return true, nil
}
