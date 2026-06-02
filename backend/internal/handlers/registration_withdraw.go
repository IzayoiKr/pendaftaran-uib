package handlers

import (
	"database/sql"
	"errors"
	"log/slog"
	"net/http"

	"pendaftaran-uib/backend/internal/audit"
	"pendaftaran-uib/backend/internal/auth"
	"pendaftaran-uib/backend/internal/i18n"
	"pendaftaran-uib/backend/internal/utils"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

func RegistrationWithdraw(db *sql.DB, al *audit.Logger) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		base := audit.EntryFromRequest(r)
		lang := utils.Lang(r)

		claims := auth.GetClaims(r)
		if claims == nil {
			utils.WriteJSON(w, http.StatusUnauthorized, utils.ErrJSON(i18n.T("common.unauthorized", lang)))
			return
		}

		batchKey := chi.URLParam(r, "batchKey")
		if batchKey == "" {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON(i18n.T("common.invalid_request", lang)))
			return
		}

		userID, err := uuid.Parse(claims.UserID)
		if err != nil {
			slog.Error("registration_withdraw: parse uuid", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}

		var (
			regID uuid.UUID
			currentStatus string
		)
		err = db.QueryRowContext(r.Context(), `
			SELECT reg.id, reg.status
			FROM registration reg
			INNER JOIN gelombang g ON g.id = reg.gelombang_id
			WHERE reg.user_id = ? AND g.batch_key = ?`,
			userID[:], batchKey,
		).Scan(&regID, &currentStatus)

		if errors.Is(err, sql.ErrNoRows) {
			utils.WriteJSON(w, http.StatusNotFound, utils.ErrJSON(i18n.T("registration.not_found", lang)))
			return
		}
		if err != nil {
			slog.Error("registration_withdraw: find registration", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}

		if currentStatus != "SUBMITTED" {
			utils.WriteJSON(w, http.StatusConflict, utils.ErrJSON(i18n.T("registration.withdraw_conflict", lang)))
			return
		}

		_, err = db.ExecContext(r.Context(), `
			UPDATE registration
			SET status = 'DRAFT', updated_at = NOW()
			WHERE id = ?`,
			regID[:],
		)
		if err != nil {
			slog.Error("registration_withdraw: update status", "reg_id", regID, "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}

		al.Log(audit.Entry{
			Event:     audit.EventRegistrationWithdrawn,
			UserID:    claims.UserID,
			IP:        base.IP,
			UserAgent: base.UserAgent,
			RequestID: base.RequestID,
			Meta: map[string]any{
				"batch_key": batchKey,
				"reg_id":    regID.String(),
			},
		})

		utils.WriteJSON(w, http.StatusOK, map[string]string{
			"message": i18n.T("registration.withdraw_success", lang),
			"status":  "DRAFT",
		})
	}
}
