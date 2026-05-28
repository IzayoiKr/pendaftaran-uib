package handlers

import (
	"database/sql"
	"errors"
	"log/slog"
	"net/http"

	"pendaftaran-uib/backend/internal/audit"
	"pendaftaran-uib/backend/internal/auth"
	"pendaftaran-uib/backend/internal/crypto"
	"pendaftaran-uib/backend/internal/utils"

	"github.com/google/uuid"
)

func RevealNIK(db *sql.DB, al *audit.Logger) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		base := audit.EntryFromRequest(r)

		claims := auth.GetClaims(r)
		if claims == nil {
			utils.WriteJSON(w, http.StatusUnauthorized, utils.ErrJSON("unauthorized"))
			return
		}

		id, err := uuid.Parse(claims.UserID)
		if err != nil {
			slog.Error("reveal_nik: parse uuid from claims", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}

		var encryptedNIK string
		err = db.QueryRowContext(r.Context(),
			"SELECT nik FROM users WHERE id = ?",
			id[:],
		).Scan(&encryptedNIK)

		if errors.Is(err, sql.ErrNoRows) {
			utils.WriteJSON(w, http.StatusNotFound, utils.ErrJSON("user tidak ditemukan"))
			return
		}
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}

		var plainNIK string
		if crypto.IsEncrypted(encryptedNIK) {
			plainNIK, err = crypto.DecryptNIK(encryptedNIK)
			if err != nil {
				utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
				return
			}
		}

		al.Log(audit.Entry{
			Event: audit.EventNIKRevealed,
			UserID: claims.UserID,
			IP: base.IP,
			UserAgent: base.UserAgent,
			RequestID: base.RequestID,
		})

		utils.WriteJSON(w, http.StatusOK, map[string]string{"nik": plainNIK})
	}
}
