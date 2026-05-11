package handlers

import (
	"database/sql"
	"errors"
	"log/slog"
	"net/http"
	"pendaftaran-uib/backend/internal/models"
	"pendaftaran-uib/backend/internal/utils"
	"time"

	"github.com/go-chi/chi/v5"
)

func Gelombang(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		rows, err := db.QueryContext(r.Context(), `
		SELECT id, batch_key, batch_name, program_type, program_type_en,
		degree, academic_year, image_path, event_date,
		start_time, end_time, location, registration_start, registration_end
			FROM gelombang
			WHERE registration_end >= CURRENT_DATE()
			ORDER BY registration_start DESC
		`)
		if err != nil {
			slog.Error("gelombang: query error", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}
		defer rows.Close()

		gelombang := make([]models.GelombangDTO, 0)
		for rows.Next() {
			var g models.GelombangDTO
			var eventDate, regStart, regEnd time.Time
			var startTimeStr, endTimeStr string

			if err := rows.Scan(
				&g.ID, &g.BatchKey, &g.BatchName, &g.ProgramType, &g.ProgramTypeEn,
				&g.Degree, &g.AcademicYear, &g.ImagePath, &eventDate,
				&startTimeStr, &endTimeStr, &g.Location, &regStart, &regEnd,
			); err != nil {
				slog.Error("gelombang: scan error", "error", err)
				utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
				return
			}

			formatGelombang(&g, eventDate, regStart, regEnd, startTimeStr, endTimeStr)
			gelombang = append(gelombang, g)
		}

		if err := rows.Err(); err != nil {
			slog.Error("gelombang: rows iteration error", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}
		utils.WriteJSON(w, http.StatusOK, gelombang)
	}
}

// GetGelombangList is an alias for Gelombang to satisfy remote naming if needed
func GetGelombangList(db *sql.DB) http.HandlerFunc {
	return Gelombang(db)
}

// GetGelombangByKey — GET /api/gelombang/{registrationKey}
func GetGelombangByKey(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		key := chi.URLParam(r, "registrationKey")
		if key == "" {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON("registration key wajib diisi"))
			return
		}

		var g models.GelombangDTO
		var eventDate, regStart, regEnd time.Time
		var startTimeStr, endTimeStr string

		err := db.QueryRowContext(r.Context(), `
			SELECT id, batch_key, batch_name, program_type, program_type_en,
			degree, academic_year, image_path, event_date,
			start_time, end_time, location, registration_start, registration_end
			FROM gelombang
			WHERE batch_key = ?
		`, key).Scan(
			&g.ID, &g.BatchKey, &g.BatchName, &g.ProgramType, &g.ProgramTypeEn,
			&g.Degree, &g.AcademicYear, &g.ImagePath, &eventDate,
			&startTimeStr, &endTimeStr, &g.Location, &regStart, &regEnd,
		)
		if errors.Is(err, sql.ErrNoRows) {
			utils.WriteJSON(w, http.StatusNotFound, utils.ErrJSON("Gelombang tidak ditemukan"))
			return
		}
		if err != nil {
			slog.Error("gelombang: query error", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}

		formatGelombang(&g, eventDate, regStart, regEnd, startTimeStr, endTimeStr)
		utils.WriteJSON(w, http.StatusOK, g)
	}
}

func formatGelombang(g *models.GelombangDTO, eventDate, regStart, regEnd time.Time, startTimeStr, endTimeStr string) {
	g.Day = eventDate.Format("02")
	g.Month = eventDate.Format("Jan")

	parsedStart, err := time.Parse("15:04:05", startTimeStr)
	if err != nil {
		g.StartTime = startTimeStr
	} else {
		g.StartTime = parsedStart.Format("15:04")
	}

	parsedEnd, err := time.Parse("15:04:05", endTimeStr)
	if err != nil {
		g.EndTime = endTimeStr
	} else {
		g.EndTime = parsedEnd.Format("15:04")
	}

	g.RegistrationStart = regStart.Format("2006-01-02")
	g.RegistrationStartDisplay = regStart.Format("02 Jan 2006")
	g.RegistrationEnd = regEnd.Format("2006-01-02")
	g.RegistrationEndDisplay = regEnd.Format("02 Jan 2006")
}
