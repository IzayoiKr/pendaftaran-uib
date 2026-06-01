package handlers

import (
	"database/sql"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"pendaftaran-uib/backend/internal/models"
	"pendaftaran-uib/backend/internal/utils"

	"github.com/go-chi/chi/v5"
)

func RegistrationInit(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		batchKey := chi.URLParam(r, "batchKey")

		var (
			batchName, degree, batchType string
			programsJSON, feeJSON json.RawMessage
		)

		err := db.QueryRowContext(r.Context(),
			`SELECT
				g.batch_name,
				g.degree,
				g.batch_type,
				(
					SELECT JSON_ARRAYAGG(
						JSON_OBJECT('title', ps.title, 'title_en', ps.title_en)
					)
					FROM program_studi ps
					WHERE ps.is_active = 1 AND ps.degree = g.degree
					ORDER BY ps.sort_order ASC
				) as programs,
				(
					SELECT JSON_OBJECT(
						'bank_name', COALESCE(rf.bank_name, 'OCBC NISP'),
						'account_holder', COALESCE(rf.account_holder, 'Universitas Internasional Batam'),
						'account_number', COALESCE(rf.account_number, '-'),
						'amount', COALESCE(rf.amount, 0)
					)
					FROM (SELECT 1) d
					LEFT JOIN registration_fee rf ON rf.degree = g.degree AND rf.batch_type = g.batch_type
				) as fee
			 FROM gelombang g
			 INNER JOIN gelombang_detail gd ON gd.gelombang_id = g.id
			 WHERE g.batch_key = ?
			   AND gd.registration_start <= CURRENT_DATE()
			   AND gd.registration_end >= CURRENT_DATE()`,
			batchKey,
		).Scan(&batchName, &degree, &batchType, &programsJSON, &feeJSON)

		if errors.Is(err, sql.ErrNoRows) {
			utils.WriteJSON(w, http.StatusNotFound, utils.ErrJSON("pendaftaran tidak ditemukan atau sudah ditutup"))
			return
		}
		if err != nil {
			slog.Error("registration_init: query error", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}

		utils.WriteJSON(w, http.StatusOK, models.RegistrationInitDTO{
			BatchName:       batchName,
			Degree:          degree,
			BatchType:       batchType,
			Programs:        programsJSON,
			RegistrationFee: feeJSON,
		})
	}
}
