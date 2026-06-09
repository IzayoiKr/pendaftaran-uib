package handlers

import (
	"database/sql"
	"errors"
	"log/slog"
	"net/http"
	"strings"

	"pendaftaran-uib/backend/internal/auth"
	"pendaftaran-uib/backend/internal/i18n"
	"pendaftaran-uib/backend/internal/models"
	"pendaftaran-uib/backend/internal/utils"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

func GetProdiRequests(db *sql.DB) http.HandlerFunc {
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
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}

		userID, err := uuid.Parse(claims.Subject)
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}

		var (
			batchName    string
			academicYear string
			currentProdi string
			currentShift string
		)

		err = db.QueryRowContext(r.Context(), `
			SELECT
				g.batch_name,
				gd.academic_year,
				ps.code,
				rs1.class_session
			FROM registration reg
			INNER JOIN gelombang g ON g.id = reg.gelombang_id
			INNER JOIN gelombang_detail gd ON gd.gelombang_id = g.id
			LEFT JOIN registration_s1_detail rs1 ON rs1.registration_id = reg.id
			LEFT JOIN registration_s2_detail rs2 ON rs2.registration_id = reg.id
			LEFT JOIN program_studi ps ON ps.id = COALESCE(rs1.program_studi_id, rs2.program_studi_id)
			WHERE reg.id = ? AND reg.user_id = ?
			LIMIT 1`,
			regID[:], userID[:],
		).Scan(&batchName, &academicYear, &currentProdi, &currentShift)

		if errors.Is(err, sql.ErrNoRows) {
			utils.WriteJSON(w, http.StatusNotFound, utils.ErrJSON(i18n.T("registration.not_found", lang)))
			return
		}
		if err != nil {
			slog.Error("get_prodi_requests: lookup registration", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}

		currentProdi = i18n.T("program."+currentProdi+".title", lang)

		progRows, err := db.QueryContext(r.Context(), `
			SELECT ps.code
			FROM program_studi ps
			INNER JOIN gelombang g ON g.degree = ps.degree
			INNER JOIN registration reg ON reg.gelombang_id = g.id
			WHERE reg.id = ? AND ps.is_active = 1
			ORDER BY ps.sort_order ASC`,
			regID[:],
		)
		if err != nil {
			slog.Error("get_prodi_requests: query available programs", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}
		defer progRows.Close()

		availablePrograms := make([]models.ProgramChoice, 0, 20)
		for progRows.Next() {
			var code string
			if err := progRows.Scan(&code); err != nil {
				slog.Error("get_prodi_requests: scan program row", "error", err)
				utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
				return
			}
			availablePrograms = append(availablePrograms, models.ProgramChoice{
				Code:  code,
				Title: i18n.T("program."+code+".title", lang),
			})
		}
		if err := progRows.Err(); err != nil {
			slog.Error("get_prodi_requests: program rows iteration", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}

		rows, err := db.QueryContext(r.Context(), `
			SELECT
				mcr.id,
				DATE_FORMAT(mcr.requested_at, '%Y-%m-%d'),
				old_ps.code,
				mcr.old_session,
				new_ps.code,
				mcr.new_session,
				mcr.status
			FROM major_change_request mcr
			LEFT JOIN program_studi old_ps ON old_ps.id = mcr.old_program_studi_id
			LEFT JOIN program_studi new_ps ON new_ps.id = mcr.new_program_studi_id
			WHERE mcr.registration_id = ?
			ORDER BY mcr.requested_at DESC`,
			regID[:],
		)
		if err != nil {
			slog.Error("get_prodi_requests: query history", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}
		defer rows.Close()

		requests := make([]models.ProdiRequestItem, 0)
		for rows.Next() {
			var item models.ProdiRequestItem
			if err := rows.Scan(
				&item.ID,
				&item.RequestDate,
				&item.PreviousProdi,
				&item.PreviousShift,
				&item.NewProdi,
				&item.NewShift,
				&item.Status,
			); err != nil {
				slog.Error("get_prodi_requests: scan row", "error", err)
				utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
				return
			}
			item.PreviousProdi = i18n.T("program."+item.PreviousProdi+".title", lang)
			item.NewProdi = i18n.T("program."+item.NewProdi+".title", lang)
			requests = append(requests, item)
		}

		if err := rows.Err(); err != nil {
			slog.Error("get_prodi_requests: rows iteration", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}

		utils.WriteJSON(w, http.StatusOK, models.ProdiInfoResponse{
			RegistrationID: regID.String(),
			BatchName:      batchName,
			AcademicYear:   academicYear,
			CurrentProdi:   currentProdi,
			CurrentShift:   currentShift,
			AvailablePrograms: availablePrograms,
			Requests:       requests,
		})
	}
}

func CreateProdiRequest(db *sql.DB) http.HandlerFunc {
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
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON(i18n.T("common.invalid_input", lang)))
			return
		}

		userID, err := uuid.Parse(claims.Subject)
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}

		var req models.CreateProdiRequest
		if err := utils.DecodeJSON(r, &req); err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON(err.Error()))
			return
		}
		req.Sanitize()
		if err := utils.ValidateStruct(req, lang); err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON(err.Error()))
			return
		}

		var newProdi uuid.UUID
		err = db.QueryRowContext(r.Context(),
			"SELECT id FROM program_studi WHERE code = ? AND is_active = 1 LIMIT 1",
			req.NewProdiCode,
		).Scan(&newProdi)
		if errors.Is(err, sql.ErrNoRows) {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON(i18n.T("validation.oneof", lang, "{field}", i18n.T("field.ProgramStudi", lang))))
			return
		}
		if err != nil {
			slog.Error("create_prodi_request: lookup prodi", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}

		tx, err := db.BeginTx(r.Context(), nil)
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}
		committed := false
		defer func() {
			if !committed {
				_ = tx.Rollback()
			}
		}()

		var (
			oldProdi uuid.UUID
			oldSession  string
		)

		err = tx.QueryRowContext(r.Context(), `
			SELECT
				COALESCE(rs1.program_studi_id, rs2.program_studi_id),
				COALESCE(rs1.class_session, 'PAGI')
			FROM registration reg
			LEFT JOIN registration_s1_detail rs1 ON rs1.registration_id = reg.id
			LEFT JOIN registration_s2_detail rs2 ON rs2.registration_id = reg.id
			WHERE reg.id = ? AND reg.user_id = ?
			FOR UPDATE`,
			regID[:], userID[:],
		).Scan(&oldProdi, &oldSession)

		if errors.Is(err, sql.ErrNoRows) {
			utils.WriteJSON(w, http.StatusNotFound, utils.ErrJSON(i18n.T("registration.not_found", lang)))
			return
		}
		if err != nil {
			slog.Error("create_prodi_request: lock registration", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}

		var pendingCount int
		err = tx.QueryRowContext(r.Context(),
			"SELECT COUNT(*) FROM major_change_request WHERE registration_id = ? AND status = 'PENDING'",
			regID[:],
		).Scan(&pendingCount)
		if err != nil {
			slog.Error("create_prodi_request: check pending", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}
		if pendingCount > 0 {
			utils.WriteJSON(w, http.StatusConflict, utils.ErrJSON(i18n.T("prodi.pending_exists", lang)))
			return
		}

		isProdiChanging := oldProdi != newProdi
		isShiftChanging := !strings.EqualFold(oldSession, req.NewShift)

		if !isProdiChanging && !isShiftChanging {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON(i18n.T("prodi.no_changes", lang)))
			return
		}

		_, err = tx.ExecContext(r.Context(), `
			INSERT INTO major_change_request (
				registration_id,
				old_program_studi_id,
				new_program_studi_id,
				old_session,
				new_session,
				status
			) VALUES (?, ?, ?, ?, ?, 'PENDING')`,
			regID[:], oldProdi[:], newProdi[:], strings.ToUpper(oldSession), strings.ToUpper(req.NewShift),
		)
		if err != nil {
			slog.Error("create_prodi_request: insert", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}

		if err := tx.Commit(); err != nil {
			slog.Error("create_prodi_request: commit", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}
		committed = true

		utils.WriteJSON(w, http.StatusCreated, map[string]any{
			"message": i18n.T("prodi.request_created", lang),
		})
	}
}

func DeleteProdiRequest(db *sql.DB) http.HandlerFunc {
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

		requestIDStr := chi.URLParam(r, "requestID")
		if requestIDStr == "" {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON(i18n.T("common.invalid_request", lang)))
			return
		}

		userID, err := uuid.Parse(claims.Subject)
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}

		res, err := db.ExecContext(r.Context(), `
			DELETE mcr FROM major_change_request mcr
			INNER JOIN registration reg ON reg.id = mcr.registration_id
			WHERE mcr.id = ?
				AND mcr.registration_id = ?
				AND reg.user_id = ?
				AND mcr.status = 'PENDING'`,
			requestIDStr, regID[:], userID[:],
		)
		if err != nil {
			slog.Error("delete_prodi_request: exec", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}

		rowsAffected, err := res.RowsAffected()
		if err != nil {
			slog.Error("delete_prodi_request: rows affected", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}

		if rowsAffected == 0 {
			utils.WriteJSON(w, http.StatusNotFound, utils.ErrJSON(i18n.T("prodi.request_not_found", lang)))
			return
		}

		utils.WriteJSON(w, http.StatusOK, map[string]string{
			"message": i18n.T("prodi.request_cancelled", lang),
		})
	}
}
