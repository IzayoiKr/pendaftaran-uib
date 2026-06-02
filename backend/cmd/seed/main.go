package main

import (
	"context"
	"database/sql"
	"log/slog"
	"math/rand/v2"
	"os"
	"unsafe"

	"pendaftaran-uib/backend/internal/crypto"
	"pendaftaran-uib/backend/internal/db"

	"github.com/google/uuid"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}))
	slog.SetDefault(logger)

	ctx := context.Background()

	if err := crypto.InitCrypto(); err != nil {
		slog.Error("crypto init failed", "error", err)
		os.Exit(1)
	}

	provider, err := db.NewProvider(ctx)
	if err != nil {
		slog.Error("database initialization error", "error", err)
		os.Exit(1)
	}
	defer func() {
		if err := provider.Close(ctx); err != nil {
			slog.Error("database shutdown error", "error", err)
		}
	}()

	tx, err := provider.MySQL.BeginTx(ctx, nil)
	if err != nil {
		slog.Error("begin transaction failed", "error", err)
		os.Exit(1)
	}
	committed := false
	defer func() {
		if !committed {
			if err := tx.Rollback(); err != nil {
				slog.Error("rollback failed", "error", err)
			}
		}
	}()

	if err := seedProgramStudi(ctx, tx); err != nil {
		slog.Error("seed program_studi failed", "error", err)
		os.Exit(1)
	}

	if err := seedGelombang(ctx, tx); err != nil {
		slog.Error("seed gelombang failed", "error", err)
		os.Exit(1)
	}

	if err := seedRegistrationFee(ctx, tx); err != nil {
		slog.Error("seed registration_fee failed", "error", err)
		os.Exit(1)
	}

	if err := tx.Commit(); err != nil {
		slog.Error("commit failed", "error", err)
		os.Exit(1)
	}
	committed = true

	slog.Info("seed completed successfully")
}

type programStudi struct {
	id          uuid.UUID
	title       string
	code        string
	faculty     string
	degree      string
	description string
	imagePath   string
	link        string
	sortOrder   int
}

func seedProgramStudi(ctx context.Context, tx *sql.Tx) error {
	programs := []programStudi{
		{uuid.MustParse("018f7a8c-3b00-7d01-8000-000000000001"), "Teknik Sipil", "TS", "FTSP", "S1", "Sebagai program study yang menghasilkan lulusan berstandar internasional yang berkompeten dalam menerapkan keilmuan dalam pengembangan teknologi di bidang rekayasa sipil serta mampu mengaplikasikan dalam pembangunan berkelanjutan (sustainable development) di wilayah kepulauan untuk menghadapi tuntutan dan perubahan global dunia yang bersifat dinamis.", "/images/courses/TS.jpg", "https://www.uib.ac.id/ts/", 1},
		{uuid.MustParse("018f7a8c-3b00-7d02-8000-000000000002"), "Arsitektur", "AR", "FTSP", "S1", "Menjadi program studi arsitektur maritim berbasis kearifan lokal dengan daya saing global yang mendukung pembangunan wilayah pesisir berkelanjutan.", "/images/courses/AR.jpg", "https://www.uib.ac.id/arsi/", 2},
		{uuid.MustParse("018f7a8c-3b00-7d03-8000-000000000003"), "Sistem Informasi", "SI", "FIK", "S1", "Sebagai program sarjana yang menghasilkan lulusan berkualitas di bidang Sistem Informasi melalui pendidikan, penelitian, dan pengabdian kepada masyarakat, pada tingkat nasional dan internasional di tahun 2021.", "/images/courses/SI.jpg", "https://www.uib.ac.id/si/", 3},
		{uuid.MustParse("018f7a8c-3b00-7d04-8000-000000000004"), "Teknologi Informasi", "TI", "FIK", "S1", "Sebagai program sarjana yang menghasilkan lulusan berkualitas dalam bidang teknologi informasi khususnya teknologi cloud dan keamanan melalui pendidikan, penelitian, dan pengabdian masyarakat, pada tingkat nasional dan internasional di tahun 2021.", "/images/courses/TI.jpg", "https://www.uib.ac.id/ti/", 4},
		{uuid.MustParse("018f7a8c-3b00-7d05-8000-000000000005"), "Manajemen", "MN", "FBM", "S1", "Sebagai Program Sarjana Manajemen berstandar internasional dalam menghasilkan lulusan yang memiliki jiwa kepemimpinan dan kewirausahaan, berkompeten dalam bidang hubungan industri, keuangan perusahaan, pemasaran business to consumer, serta tanggap dalam mengantisipasi perubahan global yang dinamis.", "/images/courses/MN.jpg", "https://www.uib.ac.id/mn/", 5},
		{uuid.MustParse("018f7a8c-3b00-7d06-8000-000000000006"), "Akuntansi", "AK", "FBM", "S1", "Sebagai program studi yang menghasilkan lulusan profesional di bidang akuntansi keuangan sesuai standar internasional dengan jiwa kepemimpinan dan kewirausahaan serta mampu mengikuti perubahan global yang dinamis.", "/images/courses/AK.jpg", "https://www.uib.ac.id/ak/", 6},
		{uuid.MustParse("018f7a8c-3b00-7d07-8000-000000000007"), "Pariwisata", "PR", "FBM", "S1", "Menjadi program studi pariwisata dengan standar mutu internasional yang menghasilkan IPTEKS dan lulusan yang mampu mengikuti dinamika perubahan pariwisata di tingkat nasional dan internasional.", "/images/courses/PR.jpg", "https://www.uib.ac.id/par/", 7},
		{uuid.MustParse("018f7a8c-3b00-7d08-8000-000000000008"), "Magister Manajemen", "MM", "FBM", "S2", "Sebagai program studi dengan standar kualitas internasional yang menghasilkan lulusan berkualitas dengan kepemimpinan dan kewirausahaan bersemangat dan kompetensi dalam manajemen internasional di tingkat manajerial.", "/images/courses/MM.jpg", "https://www.uib.ac.id/mm/", 8},
		{uuid.MustParse("018f7a8c-3b00-7d09-8000-000000000009"), "Ilmu Hukum", "IH", "FIH", "S1", "Sebagai Program Studi dengan standar kualitas internasional yang menghasilkan lulusan hukum yang dapat memenuhi perubahan dinamis hukum bisnis dalam konteks nasional dan internasional.", "/images/courses/IH.jpg", "https://www.uib.ac.id/ih/", 9},
		{uuid.MustParse("018f7a8c-3b00-7d0a-8000-00000000000a"), "Magister Hukum", "MH", "FIH", "S2", "Sebagai program studi dengan standar mutu internasional yang menghasilkan lulusan berkualitas yang mampu mengikuti dinamika perubahan hukum bisnis di tingkat nasional dan internasional.", "/images/courses/MH.jpg", "https://www.uib.ac.id/mh/", 10},
		{uuid.MustParse("018f7a8c-3b00-7d0b-8000-00000000000b"), "Pendidikan Bahasa Inggris", "PBI", "FIP", "S1", "Menjadi program sarjana yang menghasilkan lulusan dengan kompetensi unggul dalam bidang pendidikan bahasa Inggris yang dinamis berbasis Edutechnopreneur (education, technology, and entrepreneurship) sesuai dengan standar kualitas internasional.", "/images/courses/PBI.jpg", "https://www.uib.ac.id/pbi/", 11},
		{uuid.MustParse("018f7a8c-3b00-7d0c-8000-00000000000c"), "Biologi", "BIO", "FK", "S1", "Program studi Biologi menghasilkan lulusan yang menguasai ilmu hayati, berorientasi pada penelitian, dan mampu berkontribusi dalam bidang bioteknologi, konservasi, dan pengelolaan sumber daya alam hayati di tingkat nasional maupun internasional.", "/images/courses/BIO.png", "https://www.uib.ac.id/bio/", 12},
		{uuid.MustParse("018f7a8c-3b00-7d0d-8000-00000000000d"), "Gizi", "GIZ", "FK", "S1", "Program studi Gizi bertujuan menghasilkan lulusan yang kompeten dalam ilmu gizi, mampu merancang dan mengelola program gizi masyarakat serta klinis, dan berperan aktif dalam peningkatan status gizi di tingkat nasional dan internasional.", "/images/courses/GIZ.jpg", "https://www.uib.ac.id/gizi/", 13},
		{uuid.MustParse("018f7a8c-3b00-7d0e-8000-00000000000e"), "Kedokteran", "KED", "FK", "S1", "Program studi Kedokteran menghasilkan dokter yang profesional, beretika, dan berwawasan global, mampu memberikan pelayanan kesehatan prima serta berkontribusi dalam pengembangan ilmu kedokteran dan kesehatan masyarakat.", "/images/courses/KED.jpeg", "https://www.uib.ac.id/ked/", 14},
	}

	stmt, err := tx.PrepareContext(ctx, `
		INSERT INTO program_studi (
			id, title, code, faculty, degree, description,
			image_path, link, sort_order
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
		AS new_data
		ON DUPLICATE KEY UPDATE
			id 			= new_data.id,
			faculty     = new_data.faculty,
			degree      = new_data.degree,
			description = new_data.description,
			image_path  = new_data.image_path,
			link        = new_data.link,
			sort_order  = new_data.sort_order`)
	if err != nil {
		return err
	}
	defer stmt.Close()

	for _, p := range programs {
		_, err := stmt.ExecContext(ctx, 
			p.id[:], p.title, p.code, p.faculty, p.degree, p.description,
			p.imagePath, p.link, p.sortOrder,
		)
		if err != nil {
			return err
		}
	}

	return nil
}

type gelombang struct {
	id        uuid.UUID
	batchKey  string
	batchName string
	degree    string
	batchType string
}

type gelombangDetail struct {
	gelombangID       uuid.UUID
	academicYear      int
	imagePath         string
	eventDate         string
	startTime         string
	endTime           string
	location          string
	registrationStart string
	registrationEnd   string
}

func seedGelombang(ctx context.Context, tx *sql.Tx) error {
	gelombangs := []gelombang{
		{uuid.MustParse("018f7a8c-3b00-7e02-8000-000000000101"), "magister-gelombang-1", "Gelombang 01", "S2", "Reguler"},
		{uuid.MustParse("018f7a8c-3b00-7e03-8000-000000000102"), "sarjana-kedokteran-beasiswa-gelombang-2", "Gelombang 2 Beasiswa-S1 Kedokteran", "S1", "Beasiswa"},
		{uuid.MustParse("018f7a8c-3b00-7e04-8000-000000000103"), "sarjana-beasiswa-gelombang-3", "Beasiswa III", "S1", "Beasiswa"},
		{uuid.MustParse("018f7a8c-3b00-7e05-8000-000000000104"), "sarjana-gelombang-7", "Gelombang 07", "S1", "Reguler"},
	}

	details := []gelombangDetail{
		{uuid.MustParse("018f7a8c-3b00-7e02-8000-000000000101"), 2026, "/images/event/magister.png", "2026-05-23", "09:00:00", "17:00:00", "Online", "2026-03-01", "2026-06-30"},
		{uuid.MustParse("018f7a8c-3b00-7e03-8000-000000000102"), 2026, "/images/event/GP.jpg", "2026-06-20", "09:00:00", "13:00:00", "Batam", "2026-02-09", "2026-06-13"},
		{uuid.MustParse("018f7a8c-3b00-7e04-8000-000000000103"), 2026, "/images/event/beasiswa-baru.png", "2026-06-13", "09:00:00", "16:00:00", "Online", "2025-12-08", "2026-06-12"},
		{uuid.MustParse("018f7a8c-3b00-7e05-8000-000000000104"), 2026, "/images/event/GP.jpg", "2026-06-27", "09:00:00", "16:00:00", "Online", "2026-05-11", "2026-06-26"},
	}

	stmtGelombang, err := tx.PrepareContext(ctx, `
		INSERT INTO gelombang (id, batch_key, batch_name, degree, batch_type)
		VALUES (?, ?, ?, ?, ?)
		AS new_data
		ON DUPLICATE KEY UPDATE
			id         = new_data.id,
			batch_name = new_data.batch_name,
			degree     = new_data.degree,
			batch_type = new_data.batch_type`)
	if err != nil {
		return err
	}
	defer stmtGelombang.Close()

	for _, g := range gelombangs {
		_, err := stmtGelombang.ExecContext(ctx, g.id[:], g.batchKey, g.batchName, g.degree, g.batchType)
		if err != nil {
			return err
		}
	}

	stmtDetail, err := tx.PrepareContext(ctx, `
		INSERT INTO gelombang_detail (
			gelombang_id, academic_year, image_path, event_date,
			start_time, end_time, location, registration_start, registration_end,
			usm_password
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		AS new_data
		ON DUPLICATE KEY UPDATE
			academic_year      = new_data.academic_year,
			image_path         = new_data.image_path,
			event_date         = new_data.event_date,
			start_time         = new_data.start_time,
			end_time           = new_data.end_time,
			location           = new_data.location,
			registration_start = new_data.registration_start,
			registration_end   = new_data.registration_end,
			usm_password       = new_data.usm_password`)
	if err != nil {
		return err
	}
	defer stmtDetail.Close()

	for _, d := range details {
		rawPass := generateUSMPassword()

		_, err = stmtDetail.ExecContext(ctx,
			d.gelombangID[:], d.academicYear, d.imagePath, d.eventDate,
			d.startTime, d.endTime, d.location, d.registrationStart, d.registrationEnd,
			rawPass,
		)
		if err != nil {
			return err
		}

		slog.Info("generated unique USM password for batch row", 
			"gelombang_id", d.gelombangID.String(), 
			"plain_text", rawPass,
		)
	}

	return nil
}

type registrationFee struct {
	degree        string
	batchType     string
	bankName      string
	accountHolder string
	accountNumber string
	amount        int
}

func seedRegistrationFee(ctx context.Context, tx *sql.Tx) error {
	fees := []registrationFee{
		{"S1", "Reguler", "OCBC NISP", "Universitas Internasional Batam", "094800007802", 250000},
		{"S1", "Beasiswa", "OCBC NISP", "Universitas Internasional Batam", "094800007802", 150000},
		{"S2", "Reguler", "OCBC NISP", "Universitas Internasional Batam", "094800007802", 1500000},
		{"S2", "Beasiswa", "OCBC NISP", "Universitas Internasional Batam", "094800007802", 1500000},
	}

	stmt, err := tx.PrepareContext(ctx, `
		INSERT INTO registration_fee (
			degree, batch_type, bank_name, account_holder, account_number, amount
		) VALUES (?, ?, ?, ?, ?, ?)
		AS new_data
		ON DUPLICATE KEY UPDATE
			bank_name      = new_data.bank_name,
			account_holder = new_data.account_holder,
			account_number = new_data.account_number,
			amount         = new_data.amount`)
	if err != nil {
		return err
	}
	defer stmt.Close()

	for _, f := range fees {
		_, err := stmt.ExecContext(ctx,
			f.degree, f.batchType, f.bankName, f.accountHolder, f.accountNumber, f.amount,
		)
		if err != nil {
			return err
		}
	}
	return nil
}

const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
func generateUSMPassword() string {
	b := make([]byte, 6)
	for i := range b {
		b[i] = charset[rand.N(len(charset))]
	}
	return unsafe.String(&b[0], len(b))
}
