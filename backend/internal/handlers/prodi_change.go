package handlers

import (
	"database/sql"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"time"

	"pendaftaran-uib/backend/internal/auth"
	"pendaftaran-uib/backend/internal/i18n"
	"pendaftaran-uib/backend/internal/models"
	"pendaftaran-uib/backend/internal/utils"

	"github.com/google/uuid"
)

func GetProdiChangeRequests(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		lang := utils.Lang(r)
		claims := auth.GetClaims(r)
		if claims == nil {
			utils.WriteJSON(w, http.StatusUnauthorized, utils.ErrJSON(i18n.T("common.unauthorized", lang)))
			return
		}

		userID, err := uuid.Parse(claims.UserID)
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}

		rows, err := db.QueryContext(r.Context(), `
			SELECT 
				pcr.id, pcr.registration_id, 
				ps_old.title as prev_prodi, ps_new.title as new_prodi,
				pcr.previous_class_session, pcr.new_class_session,
				pcr.status, pcr.notes, pcr.created_at, pcr.updated_at
			FROM prodi_change_request pcr
			INNER JOIN registration r ON r.id = pcr.registration_id
			INNER JOIN program_studi ps_old ON ps_old.id = pcr.previous_program_studi_id
			INNER JOIN program_studi ps_new ON ps_new.id = pcr.new_program_studi_id
			WHERE r.user_id = ?
			ORDER BY pcr.created_at DESC`,
			userID[:],
		)
		if err != nil {
			slog.Error("get_prodi_change: query error", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}
		defer rows.Close()

		requests := make([]models.ProdiChangeRequestDTO, 0)
		for rows.Next() {
			var (
				req models.ProdiChangeRequestDTO
				createdAt, updatedAt time.Time
			)
			if err := rows.Scan(
				&req.ID, &req.RegistrationID,
				&req.PreviousProgramStudi, &req.NewProgramStudi,
				&req.PreviousClassSession, &req.NewClassSession,
				&req.Status, &req.Notes, &createdAt, &updatedAt,
			); err != nil {
				slog.Error("get_prodi_change: scan error", "error", err)
				utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
				return
			}
			req.CreatedAt = createdAt.Format("2006-01-02 15:04:05")
			req.UpdatedAt = updatedAt.Format("2006-01-02 15:04:05")
			requests = append(requests, req)
		}

		utils.WriteJSON(w, http.StatusOK, requests)
	}
}

func CreateProdiChangeRequest(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		lang := utils.Lang(r)
		claims := auth.GetClaims(r)
		if claims == nil {
			utils.WriteJSON(w, http.StatusUnauthorized, utils.ErrJSON(i18n.T("common.unauthorized", lang)))
			return
		}

		userID, err := uuid.Parse(claims.UserID)
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}

		var input models.CreateProdiChangeRequest
		if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON(i18n.T("common.invalid_request", lang)))
			return
		}

		if err := utils.ValidateStruct(input, lang); err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON(err.Error()))
			return
		}

		// Verify registration belongs to user and is in appropriate status
		// and get current prodi/session
		var (
			prevProdiID uuid.UUID
			prevSession string
			degree string
		)
		err = db.QueryRowContext(r.Context(), `
			SELECT 
				COALESCE(rs1.program_studi_id, rs2.program_studi_id) as prodi_id,
				COALESCE(rs1.class_session, 'pagi') as session,
				g.degree
			FROM registration r
			INNER JOIN gelombang g ON g.id = r.gelombang_id
			LEFT JOIN registration_s1_detail rs1 ON rs1.registration_id = r.id
			LEFT JOIN registration_s2_detail rs2 ON rs2.registration_id = r.id
			WHERE r.id = ? AND r.user_id = ? AND r.status IN ('SUBMITTED', 'VERIFIED')`,
			input.RegistrationID[:], userID[:],
		).Scan(&prevProdiID, &prevSession, &degree)

		if errors.Is(err, sql.ErrNoRows) {
			utils.WriteJSON(w, http.StatusForbidden, utils.ErrJSON(i18n.T("common.forbidden", lang)))
			return
		}
		if err != nil {
			slog.Error("create_prodi_change: verify registration", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}

		// Verify new prodi exists and matches degree
		var dummy int
		err = db.QueryRowContext(r.Context(),
			"SELECT 1 FROM program_studi WHERE id = ? AND degree = ? AND is_active = 1",
			input.NewProgramStudiID[:], degree,
		).Scan(&dummy)
		if errors.Is(err, sql.ErrNoRows) {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON(i18n.T("common.invalid_request", lang)))
			return
		}

		newID := utils.NewUUID()
		_, err = db.ExecContext(r.Context(), `
			INSERT INTO prodi_change_request (
				id, registration_id, previous_program_studi_id, new_program_studi_id,
				previous_class_session, new_class_session, status
			) VALUES (?, ?, ?, ?, ?, ?, 'PENDING')`,
			newID[:], input.RegistrationID[:], prevProdiID[:], input.NewProgramStudiID[:],
			prevSession, input.NewClassSession,
		)
		if err != nil {
			slog.Error("create_prodi_change: insert", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}

		utils.WriteJSON(w, http.StatusCreated, map[string]string{
			"message": i18n.T("common.saved", lang),
			"id":      newID.String(),
		})
	}
}
