package handlers

import (
	"database/sql"
	"errors"
	"log/slog"
	"net/http"

	"pendaftaran-uib/backend/internal/auth"
	"pendaftaran-uib/backend/internal/loa"
	"pendaftaran-uib/backend/internal/utils"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

func RegistrationLoA(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		batchKey := chi.URLParam(r, "batchKey")
		if batchKey == "" {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON("batch key is required"))
			return
		}

		claims := auth.GetClaims(r)
		if claims == nil {
			utils.WriteJSON(w, http.StatusUnauthorized, utils.ErrJSON("unauthorized"))
			return
		}

		userID, err := uuid.Parse(claims.Subject)
		if err != nil {
			slog.Error("registration_loa: parse user uuid", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}

		var regID uuid.UUID
		var degree string
		err = db.QueryRowContext(r.Context(), `
			SELECT r.id, g.degree
			FROM registration r
			INNER JOIN gelombang g ON g.id = r.gelombang_id
			WHERE r.user_id = ? AND g.batch_key = ? AND r.status = 'VERIFIED'`,
			userID[:], batchKey,
		).Scan(&regID, &degree)

		if errors.Is(err, sql.ErrNoRows) {
			utils.WriteJSON(w, http.StatusNotFound, utils.ErrJSON("verified registration not found"))
			return
		}
		if err != nil {
			slog.Error("registration_loa: resolve reg id", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}

		data, err := loa.LoadLoaData(r.Context(), db, regID)
		if err != nil {
			slog.Error("registration_loa: load data", "reg_id", regID.String(), "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}

		if degree == "S1" {
			fee, err := loa.CalculateS1Fee(r.Context(), db, regID)
			if err != nil {
				if errors.Is(err, loa.ErrInvalidAssessment) {
					utils.WriteJSON(w, http.StatusUnprocessableEntity,
						utils.ErrJSON("assessment not complete: usm_rank not set"))
					return
				}
				slog.Error("registration_loa: calculate s1 fee", "reg_id", regID.String(), "error", err)
				utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
				return
			}
			data.FeeS1 = fee
		} else {
			fee, err := loa.CalculateS2Fee(r.Context(), db, regID)
			if err != nil {
				slog.Error("registration_loa: calculate s2 fee", "reg_id", regID.String(), "error", err)
				utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
				return
			}
			data.FeeS2 = fee
		}

		data.NamaBank = "OCBC"
		data.NoRekening = "1222000922520000"
		data.AtasNama = "Nama Pendaftar"
		data.TanggalDeadline = "27 November 2026"
		data.TanggalSurat = "/PMB/SKL-UIB/XI/2026"
		data.CicilanDeadline = "01 Desember 2026"
		data.NomorSurat = buildNomorSurat(data)

		html, err := loa.GenerateHTML(data)
		if err != nil {
			slog.Error("registration_loa: generate html", "reg_id", regID.String(), "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}

		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		w.Header().Set("Cache-Control", "no-store")
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(html))
	}
}

func buildNomorSurat(d *loa.LoaData) string {
	if d.NomorSurat != "" {
		return d.NomorSurat
	}
	return "…/PMB-UIB/TA " + d.TahunAkademik
}
