package handlers

import (
	"database/sql"
	"log/slog"
	"net/http"
	"pendaftaran-uib/backend/internal/models"
	"pendaftaran-uib/backend/internal/utils"
	"time"
)

func Gelombang(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		rows, err := db.QueryContext(r.Context(), `
			SELECT g.id, g.batch_key, g.batch_name, g.degree, g.batch_type,
				gd.academic_year, gd.image_path, gd.event_date,
				gd.start_time, gd.end_time, gd.location,
				gd.registration_start, gd.registration_end
			FROM gelombang g
			INNER JOIN gelombang_detail gd on gd.gelombang_id = g.id
			WHERE gd.registration_start <= CURRENT_DATE()
				AND gd.registration_end > CURRENT_DATE()
			ORDER BY gd.registration_start DESC
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
				&g.ID, &g.BatchKey, &g.BatchName, &g.Degree, &g.BatchType,
				&g.AcademicYear, &g.ImagePath, &eventDate,
				&startTimeStr, &endTimeStr, &g.Location,
				&regStart, &regEnd,
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

		w.Header().Set("Cache-Control", "public, max-age=3600, stale-while-revalidate=60")
		utils.WriteJSON(w, http.StatusOK, &gelombang)
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
