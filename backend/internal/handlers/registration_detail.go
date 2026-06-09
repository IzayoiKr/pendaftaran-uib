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

func GetRegistrationDetail(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		lang := utils.Lang(r)
		claims := auth.GetClaims(r)
		if claims == nil {
			utils.WriteJSON(w, http.StatusUnauthorized, utils.ErrJSON(i18n.T("common.unauthorized", lang)))
			return
		}

		regIDStr := chi.URLParam(r, "regID")
		regID, err := uuid.Parse(regIDStr)
		if err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON(i18n.T("common.invalid_request", lang)))
			return
		}

		userID, err := uuid.Parse(claims.Subject)
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}

		var card models.RegistrationCardDTO
		var fullName, email, nik string
		var currentProdi, currentSession sql.NullString

		err = db.QueryRowContext(r.Context(), `
			SELECT
				u.full_name, u.email, u.nik,
				reg.id, reg.status, reg.examinee_id,
				g.batch_key, g.batch_name, g.degree, g.batch_type,
				gd.academic_year,
				DATE_FORMAT(gd.event_date, '%Y-%m-%d'),
				TIME_FORMAT(gd.start_time, '%H:%i'),
				DATE_FORMAT(gd.registration_end, '%Y-%m-%d'),
				ps.title,
				COALESCE(rs1.class_session, 'PAGI')
			FROM registration reg
			INNER JOIN users u ON u.id = reg.user_id
			INNER JOIN gelombang g ON g.id = reg.gelombang_id
			INNER JOIN gelombang_detail gd ON gd.gelombang_id = g.id
			LEFT JOIN registration_s1_detail rs1 ON rs1.registration_id = reg.id
			LEFT JOIN registration_s2_detail rs2 ON rs2.registration_id = reg.id
			LEFT JOIN program_studi ps ON ps.id = COALESCE(rs1.program_studi_id, rs2.program_studi_id)
			WHERE reg.id = ? AND reg.user_id = ?`,
			regID[:], userID[:],
		).Scan(
			&fullName, &email, &nik,
			&card.RegistrationID, &card.Status, &card.ExamineeID,
			&card.BatchKey, &card.BatchName, &card.Degree, &card.BatchType,
			&card.AcademicYear, &card.EventDate, &card.StartTime, &card.RegistrationEnd,
			&currentProdi, &currentSession,
		)

		if errors.Is(err, sql.ErrNoRows) {
			utils.WriteJSON(w, http.StatusNotFound, utils.ErrJSON(i18n.T("registration.not_found", lang)))
			return
		}
		if err != nil {
			slog.Error("get_registration_detail: query error", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}

		utils.WriteJSON(w, http.StatusOK, map[string]any{
			"registration": card,
			"user": map[string]string{
				"full_name": fullName,
				"email":     email,
				"nik":       decryptAndMask(nik),
			},
			"current_prodi":   currentProdi.String,
			"current_session": currentSession.String,
		})
	}
}
