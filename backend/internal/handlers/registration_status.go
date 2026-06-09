package handlers

import (
	"database/sql"
	"errors"
	"log/slog"
	"net/http"

	"pendaftaran-uib/backend/internal/auth"
	"pendaftaran-uib/backend/internal/i18n"
	"pendaftaran-uib/backend/internal/models"
	"pendaftaran-uib/backend/internal/utils"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

func RegistrationStatus(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		batchKey := chi.URLParam(r, "batchKey")
		lang := utils.Lang(r)

		if batchKey == "" {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON(i18n.T("common.invalid_request", lang)))
			return
		}

		claims := auth.GetClaims(r)
		if claims == nil {
			utils.WriteJSON(w, http.StatusUnauthorized, utils.ErrJSON(i18n.T("common.unauthorized", lang)))
			return
		}

		userID, err := uuid.Parse(claims.Subject)
		if err != nil {
			slog.Error("registration_status: parse uuid from claims", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}

		var (
			regID uuid.UUID
			status string
			degree string
		)

		err = db.QueryRowContext(r.Context(), `
			SELECT reg.id, reg.status, g.degree
			FROM registration reg
			INNER JOIN gelombang g ON g.id = reg.gelombang_id
			WHERE reg.user_id = ? AND g.batch_key = ?`,
			userID[:], batchKey,
		).Scan(&regID, &status, &degree)

		if errors.Is(err, sql.ErrNoRows) {
			utils.WriteJSON(w, http.StatusOK, models.RegistrationStatusResponse{
				Status: "NONE",
			})
			return
		}
		if err != nil {
			slog.Error("registration_status: query registration", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}

		resp := models.RegistrationStatusResponse{
			Status: status,
		}

		if status == "DRAFT" || status == "REJECTED" || status == "SUBMITTED" {
			draftData, err := loadDraftData(r, db, regID, degree)
			if err != nil {
				slog.Error("registration_status: load draft data", "reg_id", regID.String(), "error", err)
				utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
				return
			}
			resp.DraftData = draftData
		}

		utils.WriteJSON(w, http.StatusOK, resp)
	}
}
