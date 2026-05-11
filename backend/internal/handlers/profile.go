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

		res := models.ProfileResponse{
			FullName:      user.FullName,
			NIK:           user.NIK,
			Email:         user.Email,
			Registrations: []models.RegistrationDTO{},
		}

		// 1. Check s1_registrations
		rowsS1, err := db.QueryContext(r.Context(), `
			SELECT r.id, YEAR(r.created_at), r.batch_name, p.title, r.doc_check_status, r.payment_status
			FROM s1_registrations r
			JOIN program_studi p ON r.prodi_pil = p.id
			WHERE r.user_id = ?
		`, claims.UserID)
		if err == nil {
			defer rowsS1.Close()
			for rowsS1.Next() {
				var reg models.RegistrationDTO
				if err := rowsS1.Scan(&reg.NomorDaftar, &reg.Periode, &reg.Gelombang, &reg.Jurusan, &reg.Biodata, &reg.Pembayaran); err == nil {
					res.Registrations = append(res.Registrations, reg)
				}
			}
		}

		// 2. Check s2_registrations
		rowsS2, err := db.QueryContext(r.Context(), `
			SELECT id, YEAR(created_at), batch_name, jurusan, doc_status, payment_status
			FROM s2_registrations
			WHERE user_id = ?
		`, claims.UserID)
		if err == nil {
			defer rowsS2.Close()
			for rowsS2.Next() {
				var reg models.RegistrationDTO
				if err := rowsS2.Scan(&reg.NomorDaftar, &reg.Periode, &reg.Gelombang, &reg.Jurusan, &reg.Biodata, &reg.Pembayaran); err == nil {
					res.Registrations = append(res.Registrations, reg)
				}
			}
		}

		utils.WriteJSON(w, http.StatusOK, res)
	}
}
