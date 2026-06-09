package handlers

import (
	"database/sql"
	"log/slog"
	"net/http"
	"pendaftaran-uib/backend/internal/i18n"
	"pendaftaran-uib/backend/internal/models"
	"pendaftaran-uib/backend/internal/utils"
)

func ProgramStudi(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		lang := utils.Lang(r)

		rows, err := db.QueryContext(r.Context(),
			`SELECT id, code, faculty, degree, image_path, link
			FROM program_studi
			WHERE is_active = 1
			ORDER BY sort_order ASC`,
		)
		if err != nil {
			slog.Error("program_studi: query error", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}
		defer rows.Close()

		programs := make([]models.ProgramStudiDTO, 0, 20)
		for rows.Next() {
			var p models.ProgramStudiDTO
			var code string
			if err := rows.Scan(
				&p.ID, &code, &p.Faculty, &p.Degree, &p.ImagePath, &p.Link,
			); err != nil {
				slog.Error("program_studi: scan error", "error", err)
				utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
				return
			}

			p.Title = i18n.T("program."+code+".title", lang)
			p.Description = i18n.T("program."+code+".description", lang)
			programs = append(programs, p)
		}

		if err := rows.Err(); err != nil {
			slog.Error("program_studi: rows iteration error", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}

		w.Header().Set("Cache-Control", "public, max-age=3600, stale-while-revalidate=60")
		utils.WriteJSON(w, http.StatusOK, programs)
	}
}
