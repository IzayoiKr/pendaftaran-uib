package handlers

import (
	"database/sql"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"path/filepath"

	"pendaftaran-uib/backend/internal/audit"
	"pendaftaran-uib/backend/internal/auth"
	"pendaftaran-uib/backend/internal/utils"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

func RegistrationDelete(db *sql.DB, storageDir string, al *audit.Logger) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		base := audit.EntryFromRequest(r)

		claims := auth.GetClaims(r)
		if claims == nil {
			utils.WriteJSON(w, http.StatusUnauthorized, utils.ErrJSON("unauthorized"))
			return
		}

		batchKey := chi.URLParam(r, "batchKey")
		if batchKey == "" {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON("permintaan tidak valid"))
			return
		}

		userID, err := uuid.Parse(claims.UserID)
		if err != nil {
			slog.Error("registration_delete: parse uuid", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
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
			utils.WriteJSON(w, http.StatusNotFound, utils.ErrJSON("pendaftaran tidak ditemukan"))
			return
		}
		if err != nil {
			slog.Error("registration_delete: find registration", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}
		if currentStatus != "DRAFT" && currentStatus != "REJECTED"  {
			utils.WriteJSON(w, http.StatusConflict, utils.ErrJSON("hanya pendaftaran berstatus draft dan ditolak yang dapat dihapus"))
			return
		}

		_, err = db.ExecContext(r.Context(),
			"DELETE FROM registration WHERE id = ?",
			regID[:],
		)
		if err != nil {
			slog.Error("registration_delete: delete registration", "reg_id", regID, "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}

		regDir := filepath.Join(storageDir, "registrations", claims.UserID, regID.String())
		if err := os.RemoveAll(regDir); err != nil && !errors.Is(err, os.ErrNotExist) {
			slog.Warn("registration_delete: remove directory", "dir", regDir, "error", err)
		}

		al.Log(audit.Entry{
			Event:     audit.EventRegistrationDeleted,
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
			"message": "pendaftaran berhasil dihapus",
		})
	}
}
