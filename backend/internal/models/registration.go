package models

import "time"

// S1Registration represents the undergraduate registration data
type S1Registration struct {
	ID                  string    `json:"id" db:"id"`
	UserID              string    `json:"user_id" db:"user_id"`
	RegistrationKey     string    `json:"registration_key" db:"registration_key"`
	BatchName           string    `json:"batch_name" db:"batch_name"`
	
	// Biodata
	NIK                 string    `json:"nik" db:"nik"`
	Email               string    `json:"email" db:"email"`
	Nama                string    `json:"nama" db:"nama"`
	JK                  string    `json:"jk" db:"jk"`
	Kewarganegaraan     string    `json:"kewarganegaraan" db:"kewarganegaraan"`
	TempatLahir         string    `json:"tempat_lahir" db:"tempat_lahir"`
	TanggalLahir        string    `json:"tanggal_lahir" db:"tanggal_lahir"` // Use string for simple YYYY-MM-DD parsing, or time.Time
	NoHP                string    `json:"no_hp" db:"no_hp"`
	NoHP2               string    `json:"no_hp2" db:"no_hp2"`
	JenisDaftar         string    `json:"jenis_daftar" db:"jenis_daftar"`
	ProdiPil            string    `json:"prodi_pil" db:"prodi_pil"`
	WaktuKuliah         string    `json:"waktu_kuliah" db:"waktu_kuliah"`
	AsalSekolah         string    `json:"asal_sekolah" db:"asal_sekolah"`
	
	// Document Paths
	KTPPath             string    `json:"ktp_path" db:"ktp_path"`
	KKPath              string    `json:"kk_path" db:"kk_path"`
	IjazahPath          string    `json:"ijazah_path" db:"ijazah_path"`
	TranskripNilaiPath  string    `json:"transkrip_nilai_path" db:"transkrip_nilai_path"`
	BuktiBayarPath      string    `json:"bukti_bayar_path" db:"bukti_bayar_path"`
	
	// Status
	DocCheckStatus      string    `json:"doc_check_status" db:"doc_check_status"`
	PaymentStatus       string    `json:"payment_status" db:"payment_status"`
	
	CreatedAt           time.Time `json:"created_at" db:"created_at"`
	UpdatedAt           time.Time `json:"updated_at" db:"updated_at"`
}

// S2Registration represents the graduate registration data
type S2Registration struct {
	ID                  string    `json:"id" db:"id"`
	UserID              string    `json:"user_id" db:"user_id"`
	RegistrationKey     string    `json:"registration_key" db:"registration_key"`
	BatchName           string    `json:"batch_name" db:"batch_name"`
	
	// Biodata
	NIK                 string    `json:"nik" db:"nik"`
	Nama                string    `json:"nama" db:"nama"`
	Email               string    `json:"email" db:"email"`
	NoHP                string    `json:"no_hp" db:"no_hp"`
	Jurusan             string    `json:"jurusan" db:"jurusan"`
	IPK                 float64   `json:"ipk" db:"ipk"`
	Gelar               string    `json:"gelar" db:"gelar"`
	
	// Document Paths
	KTPPath             string    `json:"ktp_path" db:"ktp_path"`
	IjazahS1Path        string    `json:"ijazah_s1_path" db:"ijazah_s1_path"`
	TranskripS1Path     string    `json:"transkrip_s1_path" db:"transkrip_s1_path"`
	BuktiBayarPath      string    `json:"bukti_bayar_path" db:"bukti_bayar_path"`
	
	// Status
	DocStatus           string    `json:"doc_status" db:"doc_status"`
	PaymentStatus       string    `json:"payment_status" db:"payment_status"`
	
	CreatedAt           time.Time `json:"created_at" db:"created_at"`
	UpdatedAt           time.Time `json:"updated_at" db:"updated_at"`
}
