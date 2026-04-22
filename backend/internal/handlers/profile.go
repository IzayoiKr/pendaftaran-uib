package handlers

import (
	"database/sql"
	"net/http"

	"pendaftaran-uib/backend/internal/auth"
	"pendaftaran-uib/backend/internal/models"
)

func Profile(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		claims := auth.GetClaims(r)
		if claims == nil {
			writeJSON(w, http.StatusUnauthorized, errJSON("unauthorized"))
			return
		}

		var user models.User
		err := db.QueryRow(
			"SELECT full_name, nik, email FROM users WHERE id = ?",
			claims.UserID,
		).Scan(&user.FullName, &user.NIK, &user.Email)

		if err != nil {
			if err == sql.ErrNoRows {
				writeJSON(w, http.StatusNotFound, errJSON("user tidak ditemukan"))
				return
			}
			writeJSON(w, http.StatusInternalServerError, errJSON("server error"))
			return
		}

		writeJSON(w, http.StatusOK, user.ToDTO())
	}
}
