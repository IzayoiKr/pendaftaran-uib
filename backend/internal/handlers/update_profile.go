package handlers

import (
	"database/sql"
	"errors"
	"log/slog"
	"net/http"

	"pendaftaran-uib/backend/internal/audit"
	"pendaftaran-uib/backend/internal/auth"
	"pendaftaran-uib/backend/internal/models"
	"pendaftaran-uib/backend/internal/utils"
)

func UpdateProfile(db *sql.DB, al *audit.Logger) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		base := audit.EntryFromRequest(r)

		claims := auth.GetClaims(r)
		if claims == nil {
			utils.WriteJSON(w, http.StatusUnauthorized, utils.ErrJSON("unauthorized"))
			return
		}

		var req models.UpdateProfileRequest
		if err := utils.DecodeJSON(r, &req); err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON(err.Error()))
			return
		}

		req.Sanitize()
		if err := req.Validate(); err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON(err.Error()))
			return
		}

		idBytes, err := utils.UUIDToBytes(claims.UserID)
		if err != nil {
			slog.Error("reveal_nil: parse uuid to bytes", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}

		var oldFullname string
		err = db.QueryRowContext(r.Context(),
			"SELECT full_name FROM users WHERE id = ?",
			idBytes,
		).Scan(&oldFullname)

		if errors.Is(err, sql.ErrNoRows) {
			utils.WriteJSON(w, http.StatusNotFound, utils.ErrJSON("user tidak ditemukan"))
			return
		}
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}

		if oldFullname == req.FullName {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON("nama baru harus berbeda dari nama lama!"))
			return
		}

		if _, err := db.ExecContext(r.Context(),
			"UPDATE users SET full_name = ? WHERE id = ?",
			req.FullName, idBytes,
		); err != nil {
			slog.Error("update_profile: exec", "user_id", claims.UserID, "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}

		al.Log(audit.Entry{
			Event: audit.EventProfileUpdated,
			UserID: claims.UserID,
			IP: base.IP,
			UserAgent: base.UserAgent,
			RequestID: base.RequestID,
		})

		utils.WriteJSON(w, http.StatusOK, &req.FullName)
	}
}
