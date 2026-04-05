package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
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
				writeJSON(w, http.StatusConflict, errJSON("email atau NIK sudah terdaftar"))
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
		
		token, err := auth.GenerateToken(user.ID, user.Email)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, errJSON("server error"))
			return
		}

		writeJSON(w, http.StatusCreated, authResponse{Token: token, User: user.ToDTO()})
	}
}
