package loa

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/google/uuid"
)

type LoaData struct {
	Degree string

	NomorDaftar string
	NomorSurat  string

	NamaLengkap string
	NamaSekolah string

	Gelombang     string
	TahunAkademik string
	TempatUjian   string
	TanggalUjian  string

	Prodi       string
	KelasKuliah string

	NamaBeasiswa string

	NamaBank        string
	NoRekening      string
	AtasNama        string
	TanggalDeadline string
	TanggalSurat    string
	CicilanDeadline string

	FeeS1 *S1FeeBreakdown
	FeeS2 *S2FeeBreakdown
}

func LoadLoaData(ctx context.Context, db *sql.DB, regID uuid.UUID) (*LoaData, error) {
	var degree, batchName, batchType, academicYear, location, eventDate, namaLengkap string
	var examineeID sql.NullString

	err := db.QueryRowContext(ctx, `
		SELECT
			g.degree,
			g.batch_name,
			g.batch_type,
			CAST(gd.academic_year AS CHAR),
			gd.location,
			DATE_FORMAT(gd.event_date, '%d %M %Y'),
			u.full_name,
			r.examinee_id
		FROM registration r
		INNER JOIN users u ON u.id = r.user_id
		INNER JOIN gelombang g ON g.id = r.gelombang_id
		INNER JOIN gelombang_detail gd ON gd.gelombang_id = g.id
		WHERE r.id = ? AND r.status = 'VERIFIED'`,
		regID[:],
	).Scan(&degree, &batchName, &batchType, &academicYear, &location, &eventDate,
		&namaLengkap, &examineeID)

	if err == sql.ErrNoRows {
		return nil, ErrRegistrationNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("load loa core data: %w", err)
	}

	d := &LoaData{
		Degree:        degree,
		NomorDaftar:   examineeID.String,
		NamaLengkap:   namaLengkap,
		Gelombang:     batchName,
		TahunAkademik: academicYear,
		TempatUjian:   location,
		TanggalUjian:  eventDate,
	}

	if degree == "S1" {
		if err := loadS1Fields(ctx, db, regID, d); err != nil {
			return nil, err
		}
	} else {
		if err := loadS2Fields(ctx, db, regID, d); err != nil {
			return nil, err
		}
	}

	_ = batchType

	return d, nil
}

func loadS1Fields(ctx context.Context, db *sql.DB, regID uuid.UUID, d *LoaData) error {
	var prodiTitle string
	var classSession sql.NullString
	var prevHighschool sql.NullString
	var scholarshipName sql.NullString

	err := db.QueryRowContext(ctx, `
		SELECT
			ps.title,
			s1.class_session,
			s1.previous_highschool,
			sch.name
		FROM registration_s1_detail s1
		INNER JOIN program_studi ps ON ps.id = s1.program_studi_id
		LEFT  JOIN registration_s1_assessment a ON a.registration_id = s1.registration_id
		LEFT  JOIN master_s1_scholarship sch ON sch.id = a.scholarship_id
		WHERE s1.registration_id = ?`,
		regID[:],
	).Scan(&prodiTitle, &classSession, &prevHighschool, &scholarshipName)

	if err != nil {
		return fmt.Errorf("load s1 fields: %w", err)
	}

	d.Prodi = prodiTitle
	d.KelasKuliah = classSession.String
	d.NamaSekolah = prevHighschool.String
	d.NamaBeasiswa = scholarshipName.String
	return nil
}

func loadS2Fields(ctx context.Context, db *sql.DB, regID uuid.UUID, d *LoaData) error {
	var prodiTitle string
	var prevUniversity sql.NullString

	err := db.QueryRowContext(ctx, `
		SELECT
			ps.title,
			s2.previous_university
		FROM registration_s2_detail s2
		INNER JOIN program_studi ps ON ps.id = s2.program_studi_id
		WHERE s2.registration_id = ?`,
		regID[:],
	).Scan(&prodiTitle, &prevUniversity)

	if err != nil {
		return fmt.Errorf("load s2 fields: %w", err)
	}

	d.Prodi = prodiTitle
	d.KelasKuliah = ""
	d.NamaSekolah = prevUniversity.String
	d.NamaBeasiswa = ""
	return nil
}
