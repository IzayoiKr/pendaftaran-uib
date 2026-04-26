package handlers

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/mail"
	"net/url"
	"os"
	"strings"

	"pendaftaran-uib/backend/internal/models"
	"pendaftaran-uib/backend/internal/utils"

	"github.com/go-sql-driver/mysql"
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

func Register(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req registerRequest
		if err:= json.NewDecoder(r.Body).Decode(&req); err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON("permintaan tidak valid"))
			return
		}

		switch {
		case strings.TrimSpace(req.FullName) == "":
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON("name lengkap wajib diisi"))
			return
		case len(req.NIK) != 16:
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON("NIK harus 16 digit"))
			return
		case !utils.IsAllDigits(req.NIK):
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON("NIK harus berupa angka"))
			return
		case req.Email == "":
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON("email wajib diisi"))
			return
		case len(req.Password) < 8:
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON("password minimal 8 karakter"))
			return
		case req.TurnstileToken == "":
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON("verifikasi CAPTCHA diperlukan"))
			return
		}

		if _, err := mail.ParseAddress(req.Email); err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON("format email tidak valid"))
			return
		}

		ok, err := verifyTurnstile(req.TurnstileToken, utils.RealIP(r))
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}
		if !ok {
			utils.WriteJSON(w, http.StatusForbidden, utils.ErrJSON("verifikasi CAPTCHA gagal, coba lagi"))
			return
		}

		hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}

		id := uuid.NewString()

		_, err = db.ExecContext(r.Context(),
			`INSERT INTO users (id, full_name, nik, email, password_hash)
			 VALUES (?, ?, ?, ?, ?)`,
		 id, strings.TrimSpace(req.FullName), req.NIK, req.Email, string(hash),
		)
		if err != nil {
			var mysqlErr *mysql.MySQLError
			if errors.As(err, &mysqlErr) && mysqlErr.Number == 1062 {
				utils.WriteJSON(w, http.StatusConflict, utils.ErrJSON("email sudah terdaftar"))
				return
			}
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}

		user := models.User{
			ID: id,
			FullName: strings.TrimSpace(req.FullName),
			NIK: req.NIK,
			Email: req.Email,
		}

		utils.WriteJSON(w, http.StatusCreated, user.ToDTO())
	}
}
