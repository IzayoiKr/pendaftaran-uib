package handlers

import (
	"database/sql"
	"errors"
	"net/http"

	"pendaftaran-uib/backend/internal/auth"
	"pendaftaran-uib/backend/internal/models"
	"pendaftaran-uib/backend/internal/utils"
)

func Profile(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		claims := auth.GetClaims(r)
		if claims == nil {
			utils.WriteJSON(w, http.StatusUnauthorized, utils.ErrJSON("unauthorized"))
			return
		}

		var user models.User
		err := db.QueryRowContext(r.Context(),
			"SELECT full_name, nik, email FROM user WHERE id = ?",
			claims.UserID,
		).Scan(&user.FullName, &user.NIK, &user.Email)

		if errors.Is(err, sql.ErrNoRows) {
			utils.WriteJSON(w, http.StatusNotFound, utils.ErrJSON("user tidak ditemukan"))
			return
		}
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}

		utils.WriteJSON(w, http.StatusOK, user.ToDTO())
	}
}
