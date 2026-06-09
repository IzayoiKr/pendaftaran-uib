package handlers

import (
	"database/sql"
	"errors"
	"log/slog"
	"net/http"
	"pendaftaran-uib/backend/internal/i18n"
	"pendaftaran-uib/backend/internal/models"
	"pendaftaran-uib/backend/internal/utils"

	"github.com/go-chi/chi/v5"
)

func RegistrationInit(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		batchKey := chi.URLParam(r, "batchKey")
		lang := utils.Lang(r)

		var batchName, degree, batchType string
		var bankName, accountHolder, accountNumber string
		var amount int

		err := db.QueryRowContext(r.Context(),
			`SELECT
				g.batch_name, g.degree, g.batch_type,
				rf.bank_name,
				rf.account_holder,
				rf.account_number,
				rf.amount
			 FROM gelombang g
			 INNER JOIN gelombang_detail gd ON gd.gelombang_id = g.id
			 LEFT JOIN registration_fee rf ON rf.degree = g.degree AND rf.batch_type = g.batch_type
			 WHERE g.batch_key = ?
			   AND gd.registration_start <= CURRENT_DATE()
			   AND gd.registration_end >= CURRENT_DATE()
			 LIMIT 1`,
			batchKey,
		).Scan(&batchName, &degree, &batchType, &bankName, &accountHolder, &accountNumber, &amount)

		if errors.Is(err, sql.ErrNoRows) {
			utils.WriteJSON(w, http.StatusNotFound, utils.ErrJSON(i18n.T("registration.not_found", lang)))
			return
		}
		if err != nil {
			slog.Error("registration_init: batch query error", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}

		rows, err := db.QueryContext(r.Context(),
			`SELECT code FROM program_studi
			 WHERE is_active = 1 AND degree = ?
			 ORDER BY sort_order ASC`,
			degree,
		)
		if err != nil {
			slog.Error("registration_init: programs query error", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}
		defer rows.Close()

		programs := make([]models.ProgramChoice, 0, 20)
		for rows.Next() {
			var code string
			if err := rows.Scan(&code); err != nil {
				slog.Error("registration_init: program scan error", "error", err)
				utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
				return
			}
			programs = append(programs, models.ProgramChoice{
				Code:  code,
				Title: i18n.T("program."+code+".title", lang),
			})
		}

		utils.WriteJSON(w, http.StatusOK, models.RegistrationInitDTO{
			BatchName: batchName,
			Degree:    degree,
			BatchType: batchType,
			Programs:  programs,
			RegistrationFee: models.RegistrationFee{
				BankName:      bankName,
				AccountHolder: accountHolder,
				AccountNumber: accountNumber,
				Amount:        amount,
			},
		})
	}
}
