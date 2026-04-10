package handlers

import (
	"database/sql"
	"net/http"

	"pendaftaran-uib/backend/internal/auth"
	"pendaftaran-uib/backend/internal/models"
)

func GetAccount(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Ambil ID user dari token JWT yang divalidasi oleh middleware
		claims := auth.GetClaims(r)
		if claims == nil {
			writeJSON(w, http.StatusUnauthorized, errJSON("unauthorized"))
			return
		}

		var user models.User
		// Cari user di database berdasarkan ID dari token
		err := db.QueryRow(
			"SELECT id, full_name, nik, email FROM users WHERE id = ?",
			claims.UserID,
		).Scan(&user.ID, &user.FullName, &user.NIK, &user.Email)

		if err != nil {
			if err == sql.ErrNoRows {
				writeJSON(w, http.StatusNotFound, errJSON("user tidak ditemukan"))
				return
			}
			writeJSON(w, http.StatusInternalServerError, errJSON("server error"))
			return
		}

		// Kirim data kembali ke frontend
		writeJSON(w, http.StatusOK, user.ToDTO())
	}
}
