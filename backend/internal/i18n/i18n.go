package i18n

import (
	"embed"
	"encoding/json"
	"fmt"
	"strings"
)

//go:embed locales/*.json
var localeFS embed.FS

var bundles = make(map[string]map[string]string)

var fieldLabels = map[string]map[string]string{
	"id": {
		"FullName":               "Nama",
		"NIK":                    "NIK",
		"Email":                  "Email",
		"Password":               "Password",
		"OldPassword":            "Password Lama",
		"NewPassword":            "Password Baru",
		"Token":                  "Link Verifikasi",
		"TurnstileToken":         "Verifikasi CAPTCHA",
		"JenisDaftar":            "Jenis Pendaftaran",
		"Gender":                 "Jenis Kelamin",
		"Citizenship":            "Kewarganegaraan",
		"BirthPlace":             "Tempat Lahir",
		"BirthDate":              "Tanggal Lahir",
		"PhoneNumber":            "Nomor Telepon",
		"WhatsappNumber":         "Nomor WhatsApp",
		"PreviousUniversity":     "Universitas Asal",
		"PreviousMajor":          "Program Studi Asal",
		"Gpa":                    "IPK",
		"HighestEducation":       "Pendidikan Terakhir",
		"SchoolOrigin":           "Asal Sekolah",
		"MajorChoice":            "Pilihan Program Studi",
		"WaktuKuliah":            "Waktu Kuliah",
		"HighschoolGpa":          "Nilai Rata-Rata SMA",
		"HighschoolGraduateYear": "Tahun Kelulusan SMA",
		"ContactEmail":           "Email Kontak",
		"Religion":               "Agama",
		"FundingSource":          "Sumber Pendanaan",
		"Address":                "Alamat tempat tinggal",
		"TaxID":                  "NPWP",
		"Reference":              "Referensi Pendaftaran",
		"ExpertField":            "Bidang Keahlian",
		"Degree":                 "Gelar Akademik",
		"CompanyName":            "Nama Perusahaan",
		"CompanyAddress":         "Alamat Perusahaan",
		"Position":               "Jabatan",
		"CompanyStatus":          "Status Hubungan Kerja",
		"CompanyStartYear":       "Tahun Mulai Bekerja",
		"PostalCode":             "Kode Pos",
		"Rt":                     "RT",
		"Rw":                     "RW",
		"Hamlet":                 "Dusun/Kampung",
		"SubDistrict":            "Kecamatan",
		"District":               "Kota/Kabupaten",
		"FatherName":             "Nama Ayah",
		"FatherPhone":            "Nomor Telepon Ayah",
		"FatherNik":              "NIK Ayah",
		"FatherBirthdate":        "Tanggal Lahir Ayah",
		"MotherName":             "Nama Ibu",
		"MotherPhone":            "Nomor Telepon Ibu",
		"MotherNik":              "NIK Ibu",
		"MotherBirthdate":        "Tanggal Lahir Ibu",
		"ParentsAddress":         "Alamat Orang Tua",
		"AccountHolder":          "Nama Pemilik Rekening",
		"Bank":                   "Nama Bank",
		"Confirmation":           "Konfirmasi Pernyataan",
		"Pernyataan":             "Pernyataan Persetujuan",
	},
	"en": {
		"FullName":               "Full Name",
		"NIK":                    "NIK",
		"Email":                  "Email",
		"Password":               "Password",
		"OldPassword":            "Old Password",
		"NewPassword":            "New Password",
		"Token":                  "Verification Link",
		"TurnstileToken":         "CAPTCHA Verification",
		"JenisDaftar":            "Registration Type",
		"Gender":                 "Gender",
		"Citizenship":            "Citizenship",
		"BirthPlace":             "Place of Birth",
		"BirthDate":              "Date of Birth",
		"PhoneNumber":            "Phone Number",
		"WhatsappNumber":         "WhatsApp Number",
		"PreviousUniversity":     "Previous University",
		"PreviousMajor":          "Previous Major",
		"Gpa":                    "GPA",
		"HighestEducation":       "Highest Education",
		"SchoolOrigin":           "School of Origin",
		"MajorChoice":            "Major Choice",
		"WaktuKuliah":            "Class Schedule",
		"HighschoolGpa":          "High School GPA",
		"HighschoolGraduateYear": "High School Graduate Year",
		"ContactEmail":           "Contact Email",
		"Religion":               "Religion",
		"FundingSource":          "Funding Source",
		"Address":                "Residential Address",
		"TaxID":                  "Tax ID",
		"Reference":              "Registration Reference",
		"ExpertField":            "Field of Expertise",
		"Degree":                 "Academic Degree",
		"CompanyName":            "Company Name",
		"CompanyAddress":         "Company Address",
		"Position":               "Position",
		"CompanyStatus":          "Employment Relationship Status",
		"CompanyStartYear":       "Year Started Working",
		"PostalCode":             "Postal Code",
		"Rt":                     "RT",
		"Rw":                     "RW",
		"Hamlet":                 "Hamlet",
		"SubDistrict":            "Sub-District",
		"District":               "City/District",
		"FatherName":             "Father's Name",
		"FatherPhone":            "Father's Phone Number",
		"FatherNik":              "Father's NIK",
		"FatherBirthdate":        "Father's Date of Birth",
		"MotherName":             "Mother's Name",
		"MotherPhone":            "Mother's Phone Number",
		"MotherNik":              "Mother's NIK",
		"MotherBirthdate":        "Mother's Date of Birth",
		"ParentsAddress":         "Parents' Address",
		"AccountHolder":          "Account Holder's Name",
		"Bank":                   "Bank Name",
		"Confirmation":           "Confirmation Statement",
		"Pernyataan":             "Consent Statement",
		"Pp":                     "Passport Photo",
		"Ktp":                    "ID Card / Driver License / Passport",
		"Kk":                     "Family Card",
		"TranskripNilai":         "Academic Transcript",
		"IjazahDok":              "Diploma / Certificate",
		"SktmKip":                "SKTM / KIP",
		"FotoRumah":              "House Photo",
		"TagihanListrik":         "Electricity Bill",
		"TagihanAir":             "Water Bill",
		"SertifikatPrestasi":     "Achievement Certificate",
		"Rapot1":                 "Term 1 Report",
		"Rapot2":                 "Term 2 Report",
		"Rapot3":                 "Term 3 Report",
		"Rapot4":                 "Term 4 Report",
		"Al":                     "Birth Certificate",
		"R1":                     "Bachelor Diploma",
		"R2":                     "Bachelor Academic Transcript",
		"PaymentProof":           "Payment Proof",
	},
}

func init() {
	for _, lang := range []string{"id", "en"} {
		data, err := localeFS.ReadFile("locales/" + lang + ".json")
		if err != nil {
			continue
		}
		var flat map[string]string
		_ = json.Unmarshal(data, &flat)
		bundles[lang] = flat
	}
}

// T returns a translated string. Use T("auth.login_failed", "en")
func T(key, lang string, args ...any) string {
	b, ok := bundles[lang]
	if !ok {
		b = bundles["id"] // fallback
	}
	msg, ok := b[key]
	if !ok {
		return key
	}
	if len(args) > 0 {
		return fmt.Sprintf(msg, args...)
	}
	return msg
}

// TF is shorthand with field interpolation: TF("validation.required", "en", "Email")
func TF(key, lang, field string, params ...string) string {
	b, ok := bundles[lang]
	if !ok {
		b = bundles["id"]
	}
	msg, ok := b[key]
	if !ok {
		return key
	}
	res := strings.ReplaceAll(msg, "{field}", field)
	if len(params) > 0 {
		res = strings.ReplaceAll(res, "{param}", params[0])
	}
	return res
}

// TFN is shorthand for TF with field and target (for comparison tags)
func TFN(key, lang, field, target string) string {
	b, ok := bundles[lang]
	if !ok {
		b = bundles["id"]
	}
	msg, ok := b[key]
	if !ok {
		return key
	}
	res := strings.ReplaceAll(msg, "{field}", field)
	res = strings.ReplaceAll(res, "{target}", target)
	return res
}

func FieldLabel(f string, lang string) string {
	l, ok := fieldLabels[lang]
	if !ok {
		l = fieldLabels["id"]
	}
	if label, ok := l[f]; ok {
		return label
	}
	return f
}
