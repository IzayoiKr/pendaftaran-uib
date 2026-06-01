package handlers

import (
	"database/sql"
	"log/slog"
	"net/http"

	"pendaftaran-uib/backend/internal/auth"
	"pendaftaran-uib/backend/internal/models"
	"pendaftaran-uib/backend/internal/utils"

	"github.com/google/uuid"
)

func Profile(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		claims := auth.GetClaims(r)
		if claims == nil {
			utils.WriteJSON(w, http.StatusUnauthorized, utils.ErrJSON("unauthorized"))
			return
		}

		id, err := uuid.Parse(claims.UserID)
		if err != nil {
			slog.Error("profile: parse uuid", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}

		rows, err := db.QueryContext(r.Context(), `
			SELECT 
				u.full_name, 
				u.nik, 
				u.email,
				reg.id,
				reg.status,
				reg.examinee_id,
				reg.feedback_document,
				reg.feedback_payment,
				g.batch_key,
				g.batch_name,
				g.degree,
				g.batch_type,
				gd.academic_year,
				DATE_FORMAT(gd.event_date, '%Y-%m-%d'),
				TIME_FORMAT(gd.start_time, '%H:%i'),
				DATE_FORMAT(gd.registration_end, '%Y-%m-%d'),
				gd.usm_password
			FROM users u
			LEFT JOIN registration reg ON reg.user_id = u.id
			LEFT JOIN gelombang g ON g.id = reg.gelombang_id
			LEFT JOIN gelombang_detail gd ON gd.gelombang_id = g.id
			WHERE u.id = ?
			ORDER BY reg.created_at DESC`,
			id[:],
		)
		if err != nil {
			slog.Error("profile: database query execution", "user_id", claims.UserID, "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}
		defer rows.Close()

		var (
			user models.User
			cards = make([]models.RegistrationCardDTO, 0)
			isUserFound = false
		)

		for rows.Next() {
			isUserFound = true
			
			var (
				regID            *uuid.UUID
				status           sql.NullString
				examineeNumber   sql.NullString
				feedbackDocument sql.NullString
				feedbackPayment  sql.NullString
				batchKey         sql.NullString
				batchName        sql.NullString
				degree           sql.NullString
				batchType        sql.NullString
				academicYear     sql.NullString
				eventDate        sql.NullString
				startTime        sql.NullString
				registrationEnd  sql.NullString
				usmPassword      sql.NullString
			)

			err := rows.Scan(
				&user.FullName, &user.NIK, &user.Email,
				&regID, &status, &examineeNumber, &feedbackDocument, &feedbackPayment,
				&batchKey, &batchName, &degree, &batchType, &academicYear,
				&eventDate, &startTime, &registrationEnd, &usmPassword,
			)
			if err != nil {
				slog.Error("profile: scanning rows failed", "error", err)
				utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
				return
			}
			if regID == nil {
				continue
			}

			card := models.RegistrationCardDTO{
				RegistrationID:  regID.String(),
				Status:          status.String,
				BatchKey:        batchKey.String,
				BatchName:       batchName.String,
				Degree:          degree.String,
				BatchType:       batchType.String,
				AcademicYear:    academicYear.String,
				EventDate:       eventDate.String,
				StartTime:       startTime.String,
				RegistrationEnd: registrationEnd.String,
			}

			switch status.String {
			case "REJECTED":
				if feedbackDocument.Valid { card.FeedbackDocument = &feedbackDocument.String }
				if feedbackPayment.Valid  { card.FeedbackPayment = &feedbackPayment.String }
			case "VERIFIED":
				if examineeNumber.Valid   { card.ExamineeID = &examineeNumber.String }
				if usmPassword.Valid      { card.USMPassword = &usmPassword.String }
			}

			cards = append(cards, card)
		}

		if !isUserFound {
			utils.WriteJSON(w, http.StatusNotFound, utils.ErrJSON("user tidak ditemukan"))
			return
		}

		maskedNIK := decryptAndMask(user.NIK)

		utils.WriteJSON(w, http.StatusOK, models.ProfileDTO{
			UserDTO: user.ToDTO(maskedNIK),
			Registrations: cards,
		})
	}
}
