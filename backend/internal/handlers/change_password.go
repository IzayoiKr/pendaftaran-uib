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

	"golang.org/x/crypto/bcrypt"
)

func ChangePassword(db *sql.DB, ts *auth.TokenStore, al *audit.Logger) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		base := audit.EntryFromRequest(r)

		claims := auth.GetClaims(r)
		if claims == nil {
			utils.WriteJSON(w, http.StatusUnauthorized, utils.ErrJSON("unauthorized"))
			return
		}

		var req models.ChangePasswordRequest
		if err := utils.DecodeJSON(r, &req); err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON(err.Error()))
			return
		}

		if err := req.Validate(); err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON(err.Error()))
			return
		}

		var currentHash string
		err := db.QueryRowContext(r.Context(),
			"SELECT password_hash FROM user WHERE id = ?",
			claims.UserID,
		).Scan(&currentHash)

		if errors.Is(err, sql.ErrNoRows) {
			utils.WriteJSON(w, http.StatusNotFound, utils.ErrJSON("user tidak ditemukan"))
			return
		}
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}

		if err := bcrypt.CompareHashAndPassword([]byte(currentHash), []byte(req.OldPassword)); err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON("password lama tidak sesuai"))
			return
		}

		newHash, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}

		if _, err = db.ExecContext(r.Context(),
			"UPDATE user SET password_hash = ? WHERE id = ?",
			string(newHash), claims.UserID,
		); err != nil {
			slog.Error("change_password: exec", "user_id", claims.UserID, "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}

		if err := ts.Revoke(r.Context(), claims); err != nil {
			slog.Error("change_password: revoke access token", "jti", claims.ID, "error", err)
		}

		if err := ts.RevokeAllUserSessions(r.Context(), claims.UserID); err != nil {
			slog.Error("change_password: revoke all sessions",
				"user_id", claims.UserID,
				"error", err,
			)
		}

		al.Log(audit.Entry{
			Event: audit.EventPasswordChanged,
			UserID: claims.UserID,
			IP: base.IP,
			UserAgent: base.UserAgent,
			RequestID: base.RequestID,
		})

		utils.WriteJSON(w, http.StatusOK, map[string]string{
			"message": "password berhasil diubah, sesi lain telah dinonaktifkan",
		})
	}
}
