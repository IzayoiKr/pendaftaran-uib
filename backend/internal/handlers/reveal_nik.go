package handlers

import (
	"database/sql"
	"errors"
	"log/slog"
	"net/http"

	"pendaftaran-uib/backend/internal/audit"
	"pendaftaran-uib/backend/internal/auth"
	nikCrypto "pendaftaran-uib/backend/internal/crypto"
	"pendaftaran-uib/backend/internal/utils"
)

func RevealNIK(db *sql.DB, al *audit.Logger) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		base := audit.EntryFromRequest(r)

		claims := auth.GetClaims(r)
		if claims == nil {
			utils.WriteJSON(w, http.StatusUnauthorized, utils.ErrJSON("unauthorized"))
			return
		}

		idBytes, err := utils.UUIDToBytes(claims.UserID)
		if err != nil {
			slog.Error("reveal_nik: parse uuid to bytes", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}

		var encryptedNIK string
		err = db.QueryRowContext(r.Context(),
			"SELECT nik FROM users WHERE id = ?",
			idBytes,
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
		if nikCrypto.IsEncrypted(encryptedNIK) {
			plainNIK, err = nikCrypto.DecryptNIK(encryptedNIK)
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
