package handlers

import (
	"database/sql"
	"fmt"
	"log/slog"
	"net/http"
	"time"

	"pendaftaran-uib/backend/internal/auth"
	"pendaftaran-uib/backend/internal/utils"
)

func GetRegistrationStatus(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		claims := auth.GetClaims(r)
		if claims == nil {
			utils.WriteJSON(w, http.StatusUnauthorized, utils.ErrJSON("unauthorized"))
			return
		}

		type RegistrationInfo struct {
			RegistrationNumber string `json:"registration_number"`
			Period             int    `json:"period"`
			Batch              string `json:"batch"`
			Major              string `json:"major"`
			BiodataStatus      string `json:"biodata_status"`
			PaymentStatus      string `json:"payment_status"`
			USM                string `json:"usm"`
			USMPassword        string `json:"usm_password"`
			USMResult          string `json:"usm_result"`
		}

		registrations := []RegistrationInfo{}

		idBytes, err := utils.UUIDToBytes(claims.UserID)
		if err != nil {
			slog.Error("registration_status: parse uuid to bytes", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}


		// Check S1 registrations
		rows, err := db.QueryContext(r.Context(), `
			SELECT r.id, YEAR(r.created_at), r.batch_name, p.title, r.doc_check_status, r.payment_status, r.registration_key, r.created_at,
				g.event_date, g.start_time, g.end_time, g.location, g.usm_password, r.usm_status
			FROM s1_registrations r
			JOIN program_studi p ON r.prodi_pil = p.id
			LEFT JOIN gelombang g ON r.registration_key = g.batch_key
			WHERE r.user_id = ?
		`, idBytes)

		if err == nil {
			defer rows.Close()
			for rows.Next() {
				var reg RegistrationInfo
				var regKey, completeness, payment string
				var createdAt time.Time
				var eventDate sql.NullTime
				var startTime, endTime, location, usmPass, usmStatus sql.NullString
				if err := rows.Scan(&reg.RegistrationNumber, &reg.Period, &reg.Batch, &reg.Major, &completeness, &payment, &regKey, &createdAt, &eventDate, &startTime, &endTime, &location, &usmPass, &usmStatus); err == nil {
					reg.RegistrationNumber, _ = GetRegistrationID(r.Context(), db, reg.RegistrationNumber, regKey, createdAt, false)
					reg.BiodataStatus = completeness
					reg.PaymentStatus = payment
					reg.USMResult = usmStatus.String

					if completeness == "Telah Lengkap" && payment == "Telah Lunas" {
						sTime := "00:00"
						if len(startTime.String) >= 5 { sTime = startTime.String[:5] }
						eTime := "00:00"
						if len(endTime.String) >= 5 { eTime = endTime.String[:5] }

						reg.USM = fmt.Sprintf("%s,\n%s\n(%s - %s)",
							location.String,
							eventDate.Time.Format("02 Jan 2006"),
							sTime,
							eTime)
						reg.USMPassword = usmPass.String
						if reg.USMPassword == "" { reg.USMPassword = "TBA" }
					} else {
						reg.USM = "TBA"
						reg.USMPassword = "TBA"
					}
					registrations = append(registrations, reg)
				}
			}
		}

		// Check S2 registrations
		rowsS2, err := db.QueryContext(r.Context(), `
			SELECT r.id, YEAR(r.created_at), r.batch_name, r.jurusan, r.doc_status, r.payment_status, r.registration_key, r.created_at,
				g.event_date, g.start_time, g.end_time, g.location, g.usm_password, r.usm_status
			FROM s2_registrations r
			LEFT JOIN gelombang g ON r.registration_key = g.batch_key
			WHERE r.user_id = ?
		`, idBytes)

		if err == nil {
			defer rowsS2.Close()
			for rowsS2.Next() {
				var reg RegistrationInfo
				var regKey, docStatus, payment string
				var createdAt time.Time
				var eventDate sql.NullTime
				var startTime, endTime, location, usmPass, usmStatus sql.NullString
				if err := rowsS2.Scan(&reg.RegistrationNumber, &reg.Period, &reg.Batch, &reg.Major, &docStatus, &payment, &regKey, &createdAt, &eventDate, &startTime, &endTime, &location, &usmPass, &usmStatus); err == nil {
					reg.RegistrationNumber, _ = GetRegistrationID(r.Context(), db, reg.RegistrationNumber, regKey, createdAt, true)
					reg.BiodataStatus = docStatus
					reg.PaymentStatus = payment
					reg.USMResult = usmStatus.String

					if docStatus == "Telah Lengkap" && payment == "Telah Lunas" {
						sTime := "00:00"
						if len(startTime.String) >= 5 { sTime = startTime.String[:5] }
						eTime := "00:00"
						if len(endTime.String) >= 5 { eTime = endTime.String[:5] }

						reg.USM = fmt.Sprintf("%s,\n%s\n(%s - %s)",
							location.String,
							eventDate.Time.Format("02 Jan 2006"),
							sTime,
							eTime)
						reg.USMPassword = usmPass.String
						if reg.USMPassword == "" { reg.USMPassword = "TBA" }
					} else {
						reg.USM = "TBA"
						reg.USMPassword = "TBA"
					}
					registrations = append(registrations, reg)
				}
			}
		}

		utils.WriteJSON(w, http.StatusOK, map[string]interface{}{
			"is_registered": len(registrations) > 0,
			"registrations": registrations,
		})
	}
}
