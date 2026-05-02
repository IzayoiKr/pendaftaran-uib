package handlers

import (
	"database/sql"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"strings"

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

		var req models.UserDTO
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON("permintaan tidak valid"))
			return
		}

		req.FullName = strings.TrimSpace(req.FullName)
		if req.FullName == "" {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON("nama tidak boleh kosong"))
			return
		}
		if len(req.FullName) > 255 {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON("nama terlalu panjang"))
			return
		}

		_, err := db.ExecContext(r.Context(),
			"UPDATE user SET full_name = ? WHERE id = ?",
			req.FullName, claims.UserID,
		)
		if err != nil {
			slog.Error("update_profile: exec", "user_id", claims.UserID, "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}

		var newFullname models.UpdateProfileRequest
		err = db.QueryRowContext(r.Context(),
			"SELECT full_name FROM user WHERE id = ?",
			claims.UserID,
		).Scan(&newFullname.FullName)

		if errors.Is(err, sql.ErrNoRows) {
			utils.WriteJSON(w, http.StatusNotFound, utils.ErrJSON("user tidak ditemukan"))
			return
		}
		if err != nil {
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

		utils.WriteJSON(w, http.StatusOK, &newFullname)
	}
}
