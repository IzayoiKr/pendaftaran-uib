package handlers

import (
	"database/sql"
	"log/slog"
	"net/http"
	"pendaftaran-uib/backend/internal/models"
	"pendaftaran-uib/backend/internal/utils"
)

func ProgramStudi(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		degree := r.URL.Query().Get("degree")

		query := `
			SELECT id, title, faculty, degree, description, image_path, link
			FROM program_studi
			WHERE is_active = 1
		`
		args := []interface{}{}

		if degree != "" {
			query += " AND degree = ?"
			args = append(args, degree)
		}

		query += " ORDER BY sort_order ASC"

		rows, err := db.QueryContext(r.Context(), query, args...)
		if err != nil {
			slog.Error("program_studi: query error", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}
		defer rows.Close()

		programs := make([]models.ProgramStudiDTO, 0)
		for rows.Next() {
			var p models.ProgramStudiDTO
			if err := rows.Scan(&p.ID, &p.Title, &p.Faculty, &p.Degree, &p.Description, &p.ImagePath, &p.Link); err != nil {
				slog.Error("program_studi: scan error", "error", err)
				utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
				return
			}
			programs = append(programs, p)
		}

		if err := rows.Err(); err != nil {
			slog.Error("program_studi: rows iteration error", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}
		utils.WriteJSON(w, http.StatusOK, programs)
	}
}
