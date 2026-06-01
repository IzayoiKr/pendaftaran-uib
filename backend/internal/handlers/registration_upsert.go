package handlers

import (
	"database/sql"
	"net/http"
	"pendaftaran-uib/backend/internal/models"
	"strings"

	"github.com/google/uuid"
)

func upsertS1Detail(r *http.Request, tx *sql.Tx, regID uuid.UUID, form *models.RegistrationForm) error {
	majorChoiceName := nullableStr(form.MajorChoice)

	_, err := tx.ExecContext(r.Context(), `
		INSERT INTO registration_s1_detail (
			registration_id, 
			gender, 
			nationality, 
			birth_place, 
			birth_date,
			phone_number, 
			whatsapp_number, 
			registration_type,
			previous_university, 
			previous_major, 
			gpa, 
			last_education,
			previous_highschool, 
			highschool_gpa, 
			highschool_graduate_year,
			program_studi_id, 
			class_session,
			is_fresh_graduate_declared, 
			is_final_declaration_agreed
		) VALUES (
			?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
			(SELECT id FROM program_studi WHERE title = ? AND is_active = 1 LIMIT 1), 
			?, ?, ?
		) AS new_data
		ON DUPLICATE KEY UPDATE
			gender                      = new_data.gender,
			nationality                 = new_data.nationality,
			birth_place                 = new_data.birth_place,
			birth_date                  = new_data.birth_date,
			phone_number                = new_data.phone_number,
			whatsapp_number             = new_data.whatsapp_number,
			registration_type           = new_data.registration_type,
			previous_university         = new_data.previous_university,
			previous_major              = new_data.previous_major,
			gpa                         = new_data.gpa,
			last_education              = new_data.last_education,
			previous_highschool         = new_data.previous_highschool,
			highschool_gpa              = new_data.highschool_gpa,
			highschool_graduate_year    = new_data.highschool_graduate_year,
			program_studi_id            = new_data.program_studi_id,
			class_session               = new_data.class_session,
			is_fresh_graduate_declared  = new_data.is_fresh_graduate_declared,
			is_final_declaration_agreed = new_data.is_final_declaration_agreed`,
		regID[:],
		nullableStr(form.Gender),
		nullableStr(form.Citizenship),
		nullableStr(form.BirthPlace),
		nullableStr(form.BirthDate),
		nullableStr(form.PhoneNumber),
		nullableStr(form.WhatsappNumber),
		nullableStr(form.JenisDaftar),
		nullableStr(form.PreviousUniversity),
		nullableStr(form.PreviousMajor),
		nullableStr(form.Gpa),
		nullableStr(form.HighestEducation),
		nullableStr(form.SchoolOrigin),
		nullableStr(form.HighschoolGpa),
		nullableStr(form.HighschoolGraduateYear),
		majorChoiceName,
		nullableStr(form.WaktuKuliah),
		form.Confirmation,
		form.Pernyataan,
	)
	return err
}

func upsertS2Detail(r *http.Request, tx *sql.Tx, regID uuid.UUID, form *models.RegistrationForm) error {
	majorChoiceName := nullableStr(form.MajorChoice)

	_, err := tx.ExecContext(r.Context(), `
		INSERT INTO registration_s2_detail (
			registration_id, 
			nationality, 
			birth_place, 
			birth_date, 
			contact_email,
			phone_number, 
			religion, 
			funding_source, 
			tax_number, 
			reference_source,
			field_of_expertise, 
			address, 
			sub_district, 
			district, 
			hamlet, 
			postal_code,
			rt, 
			rw, 
			previous_major, 
			gpa, 
			academic_degree, 
			previous_university,
			company_name, 
			company_address, 
			job_position, 
			company_status,
			company_start_year, 
			parent_address, 
			program_studi_id,
			is_final_declaration_agreed
		) VALUES (
			?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
			(SELECT id FROM program_studi WHERE title = ? AND is_active = 1 LIMIT 1), 
			?
		) AS new_data
		ON DUPLICATE KEY UPDATE
			nationality                 = new_data.nationality,
			birth_place                 = new_data.birth_place,
			birth_date                  = new_data.birth_date,
			contact_email               = new_data.contact_email,
			phone_number                = new_data.phone_number,
			religion                    = new_data.religion,
			funding_source              = new_data.funding_source,
			tax_number                  = new_data.tax_number,
			reference_source            = new_data.reference_source,
			field_of_expertise          = new_data.field_of_expertise,
			address                     = new_data.address,
			sub_district                = new_data.sub_district,
			district                    = new_data.district,
			hamlet                      = new_data.hamlet,
			postal_code                 = new_data.postal_code,
			rt                          = new_data.rt,
			rw                          = new_data.rw,
			previous_major              = new_data.previous_major,
			gpa                         = new_data.gpa,
			academic_degree             = new_data.academic_degree,
			previous_university         = new_data.previous_university,
			company_name                = new_data.company_name,
			company_address             = new_data.company_address,
			job_position                = new_data.job_position,
			company_status              = new_data.company_status,
			company_start_year          = new_data.company_start_year,
			parent_address              = new_data.parent_address,
			program_studi_id            = new_data.program_studi_id,
			is_final_declaration_agreed = new_data.is_final_declaration_agreed`,
		regID[:],
		nullableStr(form.Citizenship),
		nullableStr(form.BirthPlace),
		nullableStr(form.BirthDate),
		nullableStr(form.ContactEmail),
		nullableStr(form.PhoneNumber),
		nullableStr(form.Religion),
		nullableStr(form.FundingSource),
		nullableStr(form.TaxID),
		nullableStr(form.Reference),
		nullableStr(form.ExpertField),
		nullableStr(form.Address),
		nullableStr(form.SubDistrict),
		nullableStr(form.District),
		nullableStr(form.Hamlet),
		nullableStr(form.PostalCode),
		nullableStr(form.Rt),
		nullableStr(form.Rw),
		nullableStr(form.PreviousMajor),
		nullableStr(form.Gpa),
		nullableStr(form.Degree),
		nullableStr(form.PreviousUniversity),
		nullableStr(form.CompanyName),
		nullableStr(form.CompanyAddress),
		nullableStr(form.Position),
		nullableStr(form.CompanyStatus),
		nullableStr(form.CompanyStartYear),
		nullableStr(form.ParentsAddress),
		majorChoiceName,
		form.Pernyataan,
	)
	if err != nil {
		return err
	}

	return upsertS2Parents(r, tx, regID, form)
}

func upsertS2Parents(r *http.Request, tx *sql.Tx, regID uuid.UUID, form *models.RegistrationForm) error {
	_, err := tx.ExecContext(r.Context(), `
		INSERT INTO registration_s2_parent_detail (
			registration_s2_id, 
			parent_type, 
			name, 
			phone_number, 
			nik, 
			birth_date,
			last_education, 
			occupation, 
			income, 
			status
		) VALUES 
			(?, 'FATHER', ?, ?, ?, ?, ?, ?, ?, ?),
			(?, 'MOTHER', ?, ?, ?, ?, ?, ?, ?, ?)
		AS new_data
		ON DUPLICATE KEY UPDATE
			name           = new_data.name,
			phone_number   = new_data.phone_number,
			nik            = new_data.nik,
			birth_date     = new_data.birth_date,
			last_education = new_data.last_education,
			occupation     = new_data.occupation,
			income         = new_data.income,
			status         = new_data.status`,
		regID[:],
		nullableStr(form.FatherName),
		nullableStr(form.FatherPhone),
		nullableStr(form.FatherNik),
		nullableStr(form.FatherBirthdate),
		nullableStr(form.FatherEducation),
		nullableStr(form.FatherOccupation),
		nullableStr(form.FatherIncome),
		nullableStr(form.FatherStatus),

		regID[:],
		nullableStr(form.MotherName),
		nullableStr(form.MotherPhone),
		nullableStr(form.MotherNik),
		nullableStr(form.MotherBirthdate),
		nullableStr(form.MotherEducation),
		nullableStr(form.MotherOccupation),
		nullableStr(form.MotherIncome),
		nullableStr(form.MotherStatus),
	)
	return err
}

func upsertPayment(
	r *http.Request, 
	tx *sql.Tx, 
	regID uuid.UUID, 
	form *models.RegistrationForm, 
	filepath string,
	fileName *string,
	fileSizeBytes *int64,
) (string, error) {
	var oldPath sql.NullString
	err := tx.QueryRowContext(r.Context(), 
		"SELECT file_path FROM registration_payment WHERE registration_id = ? FOR UPDATE", 
		regID[:],
	).Scan(&oldPath)
	
	if err != nil && err != sql.ErrNoRows {
		return "", err
	}

	_, err = tx.ExecContext(r.Context(), `
		INSERT INTO registration_payment (
			registration_id, 
			account_holder, 
			bank_name,
			file_name,
			file_size_bytes,
			file_path
		) VALUES (?, ?, ?, ?, ?, ?) AS new_data
		ON DUPLICATE KEY UPDATE
			account_holder  = new_data.account_holder,
			bank_name       = new_data.bank_name,
			file_name       = IFNULL(new_data.file_name, registration_payment.file_name),
			file_size_bytes = IFNULL(new_data.file_size_bytes, registration_payment.file_size_bytes),
			file_path       = IFNULL(new_data.file_path, registration_payment.file_path)`,
		regID[:],
		nullableStr(form.AccountHolder),
		nullableStr(form.Bank),
		fileName,
		fileSizeBytes,
		nullableStr(filepath),
	)
	if err != nil {
		return "", err
	}

	if oldPath.Valid && filepath != "" && oldPath.String != filepath {
		return oldPath.String, nil
	}

	return "", nil
}

func nullableStr(s string) any {
	trimmed := strings.TrimSpace(s)
	if trimmed == "" {
		return nil
	}
	return trimmed
}
