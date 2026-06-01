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
		classSession *string

		isFreshGrad,
		isFinal *bool
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
			ps.title,
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

	form.Gender = gender
	form.Citizenship = nationality
	form.BirthPlace = birthPlace
	form.BirthDate = birthDate
	form.PhoneNumber = phone
	form.WhatsappNumber = whatsapp
	form.JenisDaftar = regType
	form.PreviousUniversity = prevUni
	form.PreviousMajor = prevMajor
	form.Gpa = gpa
	form.HighestEducation = lastEdu
	form.SchoolOrigin = highschool
	form.HighschoolGpa = hgGpa
	form.HighschoolGraduateYear = hgGradYear
	form.MajorChoice = majorChoice
	form.WaktuKuliah = classSession
	form.Confirmation = isFreshGrad
	form.Pernyataan = isFinal

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
		programStudiTitle *string

		isFinalDeclared *bool
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
			ps.title,
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

	form.Citizenship = nationality
	form.BirthPlace = birthPlace
	form.BirthDate = birthDate
	form.ContactEmail = contactEmail
	form.PhoneNumber = phoneNumber
	form.Religion = religion
	form.FundingSource = fundingSource
	form.TaxID = taxNumber
	form.Reference = referenceSource
	form.ExpertField = fieldOfExpertise
	form.Address = address
	form.SubDistrict = subDistrict
	form.District = district
	form.Hamlet = hamlet
	form.PostalCode = postalCode
	form.Rt = rt
	form.Rw = rw
	form.PreviousMajor = previousMajor
	form.Gpa = gpa
	form.Degree = academicDegree
	form.PreviousUniversity = previousUni
	form.CompanyName = companyName
	form.CompanyAddress = companyAddress
	form.Position = jobPosition
	form.CompanyStatus = companyStatus
	form.CompanyStartYear = companyStartYear
	form.ParentsAddress = parentAddress
	form.MajorChoice = programStudiTitle
	form.Pernyataan = isFinalDeclared

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
			status *string
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
			form.FatherName = name
			form.FatherPhone = phoneNumber
			form.FatherNik = nik
			form.FatherBirthdate = birthDate
			form.FatherEducation = lastEducation
			form.FatherOccupation = occupation
			form.FatherIncome = income
			form.FatherStatus = status
		case "MOTHER":
			form.MotherName = name
			form.MotherPhone = phoneNumber
			form.MotherNik = nik
			form.MotherBirthdate = birthDate
			form.MotherEducation = lastEducation
			form.MotherOccupation = occupation
			form.MotherIncome = income
			form.MotherStatus = status
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
	var accountHolder, bankName, fileName *string
	var fileSizeBytes *uint64

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

	form.AccountHolder = accountHolder
	form.Bank = bankName

	if fileName != nil && fileSizeBytes != nil {
		form.PaymentProof = formatDelimitedValuePointer(*fileName, *fileSizeBytes)
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

func formatDelimitedValuePointer(fileName string, sizeBytes uint64) *string {
	str := formatDelimitedValue(fileName, sizeBytes)
	return &str
}
