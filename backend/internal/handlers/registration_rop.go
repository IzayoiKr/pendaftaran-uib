package handlers

import (
	"database/sql"
	"log/slog"
	"net/http"
	"strconv"

	"pendaftaran-uib/backend/internal/auth"
	"pendaftaran-uib/backend/internal/i18n"
	"pendaftaran-uib/backend/internal/receipt"
	"pendaftaran-uib/backend/internal/utils"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

func RegistrationROP(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		lang := utils.Lang(r)
		regIDStr := chi.URLParam(r, "regID")
		paymentIDStr := chi.URLParam(r, "paymentID")

		regID, err := uuid.Parse(regIDStr)
		if err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON(i18n.T("common.invalid_request", lang)))
			return
		}

		paymentID, err := strconv.ParseUint(paymentIDStr, 10, 64)
		if err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON(i18n.T("common.invalid_request", lang)))
			return
		}

		claims := auth.GetClaims(r)
		if claims == nil {
			utils.WriteJSON(w, http.StatusUnauthorized, utils.ErrJSON(i18n.T("common.unauthorized", lang)))
			return
		}

		userID, err := uuid.Parse(claims.Subject)
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}

		// Security: Verify that this registration belongs to the user
		var dummy int
		err = db.QueryRowContext(r.Context(), `
			SELECT 1 FROM registration WHERE id = ? AND user_id = ?`,
			regID[:], userID[:],
		).Scan(&dummy)

		if err != nil {
			if err == sql.ErrNoRows {
				slog.Warn("ROP access denied: registration not found or doesn't belong to user", "user_id", userID, "reg_id", regIDStr)
				utils.WriteJSON(w, http.StatusForbidden, utils.ErrJSON(i18n.T("common.forbidden", lang)))
			} else {
				slog.Error("ROP security check failed", "error", err, "reg_id", regIDStr)
				utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			}
			return
		}

		// Load receipt data
		data, err := receipt.LoadReceiptData(r.Context(), db, regID, paymentID)
		if err != nil {
			slog.Warn("failed to load receipt data", "reg_id", regIDStr, "payment_id", paymentID, "error", err)
			utils.WriteJSON(w, http.StatusNotFound, utils.ErrJSON(i18n.T("registration.not_found", lang)))
			return
		}

		// Generate HTML
		html, err := receipt.GenerateHTML(data)
		if err != nil {
			slog.Error("failed to generate receipt html", "error", err, "reg_id", regIDStr)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(i18n.T("common.server_error", lang)))
			return
		}

		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		w.Header().Set("Cache-Control", "no-store")
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(html))
	}
}
