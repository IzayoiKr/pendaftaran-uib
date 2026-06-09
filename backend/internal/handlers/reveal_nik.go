package handlers

import (
	"database/sql"
	"errors"
	"log/slog"
	"net/http"

	"pendaftaran-uib/backend/internal/audit"
	"pendaftaran-uib/backend/internal/auth"
	"pendaftaran-uib/backend/internal/crypto"
	"pendaftaran-uib/backend/internal/i18n"
	"pendaftaran-uib/backend/internal/utils"

	"github.com/google/uuid"
)

func RevealNIK(db *sql.DB, al *audit.Logger) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		base := audit.EntryFromRequest(r)
		lang := utils.Lang(r)

		claims := auth.GetClaims(r)
		if claims == nil {
			utils.WriteJSON(w, http.StatusUnauthorized, utils.ErrJSON(i18n.T("common.unauthorized", lang)))
			return
		}

		id, err := uuid.Parse(claims.Subject)
		if err != nil {
			slog.Error("reveal_nik: parse uuid from claims", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}

		var encryptedNIK string
		err = db.QueryRowContext(r.Context(),
			"SELECT nik FROM users WHERE id = ?",
			id[:],
		).Scan(&encryptedNIK)

		if errors.Is(err, sql.ErrNoRows) {
			utils.WriteJSON(w, http.StatusNotFound, utils.ErrJSON(i18n.T("common.user_not_found", lang)))
			return
		}
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}

		var byteNIK []byte
		if crypto.IsEncrypted(encryptedNIK) {
			byteNIK, err = crypto.Decrypt(encryptedNIK)
			if err != nil {
				utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
				return
			}
		}

		al.Log(audit.Entry{
			Event: audit.EventNIKRevealed,
			UserID: claims.Subject,
			IP: base.IP,
			UserAgent: base.UserAgent,
			RequestID: base.RequestID,
		})

		utils.WriteJSON(w, http.StatusOK, map[string]string{"nik": string(byteNIK)})
	}
}
