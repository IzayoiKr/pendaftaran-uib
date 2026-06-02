package handlers

import (
	"database/sql"
	"errors"
	"net/http"
	"pendaftaran-uib/backend/internal/models"
	"strconv"

	"github.com/google/uuid"
)

func loadDraftData(r *http.Request, db *sql.DB, regID uuid.UUID, degree string) (*models.RegistrationForm, error) {
	form := &models.RegistrationForm{}

	if degree == "S1" {
		if err := loadS1Detail(r, db, regID, form); err != nil {
			return nil, err
		}
	} else {
		if err := loadS2Detail(r, db, regID, form); err != nil {
			return nil, err
		}
	}

	if err := loadDocumentPaths(r, db, regID, form); err != nil {
		return nil, err
	}

	if err := loadPaymentData(r, db, regID, form); err != nil {
		return nil, err
	}

	return form, nil
}

func loadS1Detail(r *http.Request, db *sql.DB, regID uuid.UUID, form *models.RegistrationForm) error {
	var (
		gender,
		nationality,
		birthPlace,
		birthDate,
		phone,
		whatsapp,
		regType,
		prevUni,
		prevMajor,
		gpa,
		lastEdu,
		highschool,
		hgGpa,
		hgGradYear,
		majorChoice,
		classSession sql.NullString

		isFreshGrad,
		isFinal sql.NullBool
	)

	err := db.QueryRowContext(r.Context(), `
		SELECT
			d.gender,
			d.nationality,
			d.birth_place,
			DATE_FORMAT(d.birth_date, '%Y-%m-%d'),
			d.phone_number,
			d.whatsapp_number,
			d.registration_type,
			d.previous_university,
			d.previous_major,
			CAST(d.gpa AS CHAR),
			d.last_education,
			d.previous_highschool,
			CAST(d.highschool_gpa AS CHAR),
			CAST(d.highschool_graduate_year AS CHAR),
			ps.code,
			d.class_session,
			d.is_fresh_graduate_declared,
			d.is_final_declaration_agreed
		FROM registration_s1_detail d
		LEFT JOIN program_studi ps ON ps.id = d.program_studi_id
		WHERE d.registration_id = ?`,
		regID[:],
	).Scan(
		&gender,
		&nationality,
		&birthPlace,
		&birthDate,
		&phone,
		&whatsapp,
		&regType,
		&prevUni,
		&prevMajor,
		&gpa,
		&lastEdu,
		&highschool,
		&hgGpa,
		&hgGradYear,
		&majorChoice,
		&classSession,
		&isFreshGrad,
		&isFinal,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil
	}
	if err != nil {
		return err
	}

	form.Gender = gender.String
	form.Citizenship = nationality.String
	form.BirthPlace = birthPlace.String
	form.BirthDate = birthDate.String
	form.PhoneNumber = phone.String
	form.WhatsappNumber = whatsapp.String
	form.JenisDaftar = regType.String
	form.PreviousUniversity = prevUni.String
	form.PreviousMajor = prevMajor.String
	form.Gpa = gpa.String
	form.HighestEducation = lastEdu.String
	form.SchoolOrigin = highschool.String
	form.HighschoolGpa = hgGpa.String
	form.HighschoolGraduateYear = hgGradYear.String
	form.MajorChoice = majorChoice.String
	form.WaktuKuliah = classSession.String
	form.Confirmation = isFreshGrad.Bool
	form.Pernyataan = isFinal.Bool

	return nil
}

func loadS2Detail(r *http.Request, db *sql.DB, regID uuid.UUID, form *models.RegistrationForm) error {
	var (
		nationality,
		birthPlace,
		birthDate,
		contactEmail,
		phoneNumber,
		religion,
		fundingSource,
		taxNumber,
		referenceSource,
		fieldOfExpertise,
		address,
		subDistrict,
		district,
		hamlet,
		postalCode,
		rt,
		rw,
		previousMajor,
		gpa,
		academicDegree,
		previousUni,
		companyName,
		companyAddress,
		jobPosition,
		companyStatus,
		companyStartYear,
		parentAddress,
		programStudiTitle sql.NullString

		isFinalDeclared sql.NullBool
	)

	err := db.QueryRowContext(r.Context(), `
		SELECT
			d.nationality,
			d.birth_place,
			DATE_FORMAT(d.birth_date, '%Y-%m-%d'),
			d.contact_email,
			d.phone_number,
			d.religion,
			d.funding_source,
			d.tax_number,
			d.reference_source,
			d.field_of_expertise,
			d.address,
			d.sub_district,
			d.district,
			d.hamlet,
			d.postal_code,
			d.rt,
			d.rw,
			d.previous_major,
			CAST(d.gpa AS CHAR),
			d.academic_degree,
			d.previous_university,
			d.company_name,
			d.company_address,
			d.job_position,
			d.company_status,
			CAST(d.company_start_year AS CHAR),
			d.parent_address,
			ps.code,
			d.is_final_declaration_agreed
		FROM registration_s2_detail d
		LEFT JOIN program_studi ps ON ps.id = d.program_studi_id
		WHERE d.registration_id = ?`,
		regID[:],
	).Scan(
		&nationality,
		&birthPlace,
		&birthDate,
		&contactEmail,
		&phoneNumber,
		&religion,
		&fundingSource,
		&taxNumber,
		&referenceSource,
		&fieldOfExpertise,
		&address,
		&subDistrict,
		&district,
		&hamlet,
		&postalCode,
		&rt,
		&rw,
		&previousMajor,
		&gpa,
		&academicDegree,
		&previousUni,
		&companyName,
		&companyAddress,
		&jobPosition,
		&companyStatus,
		&companyStartYear,
		&parentAddress,
		&programStudiTitle,
		&isFinalDeclared,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil
	}
	if err != nil {
		return err
	}

	form.Citizenship = nationality.String
	form.BirthPlace = birthPlace.String
	form.BirthDate = birthDate.String
	form.ContactEmail = contactEmail.String
	form.PhoneNumber = phoneNumber.String
	form.Religion = religion.String
	form.FundingSource = fundingSource.String
	form.TaxID = taxNumber.String
	form.Reference = referenceSource.String
	form.ExpertField = fieldOfExpertise.String
	form.Address = address.String
	form.SubDistrict = subDistrict.String
	form.District = district.String
	form.Hamlet = hamlet.String
	form.PostalCode = postalCode.String
	form.Rt = rt.String
	form.Rw = rw.String
	form.PreviousMajor = previousMajor.String
	form.Gpa = gpa.String
	form.Degree = academicDegree.String
	form.PreviousUniversity = previousUni.String
	form.CompanyName = companyName.String
	form.CompanyAddress = companyAddress.String
	form.Position = jobPosition.String
	form.CompanyStatus = companyStatus.String
	form.CompanyStartYear = companyStartYear.String
	form.ParentsAddress = parentAddress.String
	form.MajorChoice = programStudiTitle.String
	form.Pernyataan = isFinalDeclared.Bool

	if err := loadS2Parents(r, db, regID, form); err != nil {
		return err
	}

	return nil
}

func loadS2Parents(r *http.Request, db *sql.DB, regID uuid.UUID, form *models.RegistrationForm) error {
	rows, err := db.QueryContext(r.Context(), `
		SELECT
			parent_type,
			name,
			phone_number,
			nik,
			DATE_FORMAT(birth_date, '%Y-%m-%d'),
			last_education,
			occupation,
			income,
			status
		FROM registration_s2_parent_detail
		WHERE registration_s2_id = ?`,
		regID[:],
	)
	if err != nil {
		return err
	}
	defer rows.Close()

	for rows.Next() {
		var (
			parentType string

			name,
			phoneNumber,
			nik,
			birthDate,
			lastEducation,
			occupation,
			income,
			status sql.NullString
		)

		err := rows.Scan(
			&parentType,
			&name,
			&phoneNumber,
			&nik,
			&birthDate,
			&lastEducation,
			&occupation,
			&income,
			&status,
		)
		if err != nil {
			return err
		}

		switch parentType {
		case "FATHER":
			form.FatherName = name.String
			form.FatherPhone = phoneNumber.String
			form.FatherNik = nik.String
			form.FatherBirthdate = birthDate.String
			form.FatherEducation = lastEducation.String
			form.FatherOccupation = occupation.String
			form.FatherIncome = income.String
			form.FatherStatus = status.String
		case "MOTHER":
			form.MotherName = name.String
			form.MotherPhone = phoneNumber.String
			form.MotherNik = nik.String
			form.MotherBirthdate = birthDate.String
			form.MotherEducation = lastEducation.String
			form.MotherOccupation = occupation.String
			form.MotherIncome = income.String
			form.MotherStatus = status.String
		}
	}

	return rows.Err()
}

func loadDocumentPaths(r *http.Request, db *sql.DB, regID uuid.UUID, form *models.RegistrationForm) error {
	rows, err := db.QueryContext(r.Context(), `
		SELECT document_type, file_name, file_size_bytes
		FROM registration_document
		WHERE registration_id = ?`,
		regID[:],
	)
	if err != nil {
		return err
	}
	defer rows.Close()

	for rows.Next() {
		var docType models.DocType
		var fileName string
		var fileSizeBytes uint64


		if err := rows.Scan(&docType, &fileName, &fileSizeBytes); err != nil {
			return err
		}

		if fileName == "" {
			continue
		}

		form.SetDocumentField(docType, formatDelimitedValue(fileName, fileSizeBytes))
	}

	return rows.Err()
}

func loadPaymentData(r *http.Request, db *sql.DB, regID uuid.UUID, form *models.RegistrationForm) error {
	var accountHolder, bankName, fileName sql.NullString
	var fileSizeBytes sql.NullInt64

	err := db.QueryRowContext(r.Context(), `
		SELECT account_holder, bank_name, file_name, file_size_bytes
		FROM registration_payment
		WHERE registration_id = ?`,
		regID[:],
	).Scan(&accountHolder, &bankName, &fileName, &fileSizeBytes)

	if errors.Is(err, sql.ErrNoRows) {
		return nil
	}
	if err != nil {
		return err
	}

	form.AccountHolder = accountHolder.String
	form.Bank = bankName.String

	if fileName.Valid && fileSizeBytes.Valid {
		form.PaymentProof = formatDelimitedValue(fileName.String, uint64(fileSizeBytes.Int64))
	}

	return nil
}

func formatDelimitedValue(fileName string, sizeBytes uint64) string {
	var buf [24]byte
	b := strconv.AppendUint(buf[:0], sizeBytes, 10)
	
	res := make([]byte, len(fileName)+1+len(b))
	copy(res, fileName)
	res[len(fileName)] = '|'
	copy(res[len(fileName)+1:], b)
	
	return string(res)
}
