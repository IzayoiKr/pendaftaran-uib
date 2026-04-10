package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"net"
	"net/http"
	"net/url"
	"os"
	"strings"

	"pendaftaran-uib/backend/internal/auth"
	"pendaftaran-uib/backend/internal/models"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type registerRequest struct {
	FullName string `json:"full_name"`
	NIK string `json:"nik"`
	Email string `json:"email"`
	Password string `json:"password"`
	TurnstileToken string `json:"cf_turnstile_token"`
}

type turnstileResponse struct {
	Success bool `json:"success"`
	ErrorCodes []string `json:"error-codes"`
}

func verifyTurnstile(token, remoteIP string) (bool, error) {
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

	return result.Success, nil
}

func realIP(r *http.Request) string {
	if ip := r.Header.Get("X-Real-IP"); ip != "" {
		return ip
	}
	if fwd := r.Header.Get("X-Forwarded-For"); fwd != "" {
		return strings.TrimSpace(strings.SplitN(fwd, ",", 2)[0])
	}
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return host
}

func Register(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req registerRequest
		if err:= json.NewDecoder(r.Body).Decode(&req); err != nil {
			writeJSON(w, http.StatusBadRequest, errJSON("permintaan tidak valid"))
			return
		}

		switch {
		case strings.TrimSpace(req.FullName) == "":
			writeJSON(w, http.StatusBadRequest, errJSON("name lengkap wajib diisi"))
			return
		case len(req.NIK) != 16:
			writeJSON(w, http.StatusBadRequest, errJSON("NIK harus 16 digit"))
			return
		case req.Email == "":
			writeJSON(w, http.StatusBadRequest, errJSON("email wajib diisi"))
			return
		case len(req.Password) < 8:
			writeJSON(w, http.StatusBadRequest, errJSON("password minimal 8 karakter"))
			return
		case req.TurnstileToken == "":
			writeJSON(w, http.StatusBadRequest, errJSON("verifikasi CAPTCHA diperlukan"))
			return
		}

		ok, err := verifyTurnstile(req.TurnstileToken, realIP(r))
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, errJSON("server error"))
			return
		}
		if !ok {
			writeJSON(w, http.StatusForbidden, errJSON("verifikasi CAPTCHA gagal, coba lagi"))
			return
		}

		hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, errJSON("server error"))
			return
		}

		id := uuid.NewString()

		_, err = db.ExecContext(r.Context(),
			`INSERT INTO users (id, full_name, nik, email, password_hash)
			 VALUES (?, ?, ?, ?, ?)`,
		 id, strings.TrimSpace(req.FullName), req.NIK, req.Email, string(hash),
		)
		if err != nil {
			if strings.Contains(err.Error(), "1062") {
				writeJSON(w, http.StatusConflict, errJSON("email sudah terdaftar"))
				return
			}
			writeJSON(w, http.StatusInternalServerError, errJSON("server error"))
			return
		}

		user := models.User{
			ID: id,
			FullName: strings.TrimSpace(req.FullName),
			NIK: req.NIK,
			Email: req.Email,
		}

		accessToken, err := auth.GenerateAccessToken(user.ID, user.Email)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, errJSON("server error"))
			return
		}

		refreshToken, err := auth.GenerateRefreshToken(user.ID, user.Email)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, errJSON("server error"))
			return
		}

		setRefreshCookie(w, refreshToken)

		writeJSON(w, http.StatusCreated, accessTokenResponse{
			AccessToken: accessToken,
			User: user.ToDTO(),
		})
	}
}
