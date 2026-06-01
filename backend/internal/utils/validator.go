package utils

import (
	"errors"
	"fmt"
	"reflect"
	"strconv"

	"github.com/go-playground/validator/v10"
)

var validate *validator.Validate

var fieldLabels = map[string]string{
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
}

func fieldLabel(f string) string {
	if l, ok := fieldLabels[f]; ok {
		return l
	}
	return f
}

func getStringValue(fl validator.FieldLevel) (string, bool) {
	val := fl.Field()
	if val.Kind() == reflect.Pointer {
		if val.IsNil() {
			return "", false
		}
		val = val.Elem()
	}

	if val.Kind() == reflect.String {
		return val.String(), true
	}
	return "", false
}

func InitValidator() error {
	v := validator.New()

	if err := v.RegisterValidation("alphanum_ascii", validateAlphanumASCII); err != nil {
		return fmt.Errorf("validator: register alphanum_ascii: %w", err)
	}

	if err := v.RegisterValidation("gpa", validateGpa); err != nil {
		return fmt.Errorf("validator: register gpa: %w", err)
	}

	if err := v.RegisterValidation("highschool_gpa", validateHighschoolGpa); err != nil {
		return fmt.Errorf("validator: register highschool_gpa: %w", err)
	}

	validate = v
	return nil
}

func validateAlphanumASCII(fl validator.FieldLevel) bool {
	s, ok := getStringValue(fl)
	if !ok || s == "" {
		return true
	}

	for i := 0; i < len(s); i++ {
		c := s[i]
		if (c < 'a' || c > 'z') && (c < 'A' || c > 'Z') && (c < '0' || c > '9') {
			return false
		}
	}
	return true
}

func validateGpa(fl validator.FieldLevel) bool {
	s, ok := getStringValue(fl)
	if !ok || s == "" {
		return true
	}
	if s[0] == ' ' || s[len(s)-1] == ' ' {
		return false
	}
	val, err := strconv.ParseFloat(s, 64)
	if err != nil {
		return false
	}
	return val >= 0.0 && val <= 4.0
}

func validateHighschoolGpa(fl validator.FieldLevel) bool {
	s, ok := getStringValue(fl)
	if !ok || s == "" {
		return true
	}
	if s[0] == ' ' || s[len(s)-1] == ' ' {
		return false
	}
	val, err := strconv.ParseFloat(s, 64)
	if err != nil {
		return false
	}
	return val >= 0.0 && val <= 100.0
}

func ValidateStruct(s any) error {
	if validate == nil {
		return errors.New("validator not initialized")
	}

	if err := validate.Struct(s); err != nil {
		var ve validator.ValidationErrors
		if errors.As(err, &ve) {
			return errors.New(translateFieldError(ve[0]))
		}
		return err
	}

	return nil
}

func translateFieldError(fe validator.FieldError) string {
	f := fieldLabel(fe.Field())
	p := fe.Param()

	switch fe.Tag() {
	case "required":
		return fmt.Sprintf("%s wajib diisi", f)
	case "email":
		return fmt.Sprintf("format %s tidak valid", f)
	case "min":
		return fmt.Sprintf("%s minimal %s karakter", f, p)
	case "max":
		return fmt.Sprintf("%s maksimal %s karakter", f, p)
	case "oneof":
		return fmt.Sprintf("Pilihan %s tidak valid atau tidak tersedia", f)
	case "datetime":
		return fmt.Sprintf("Format %s harus berupa tanggal valid (YYYY-MM-DD)", f)
	case "e164":
		return fmt.Sprintf("Format %s tidak valid (gunakan kode negara, contoh: +628123456789)", f)
	case "numeric":
		return fmt.Sprintf("%s hanya boleh berisi angka saja", f)
	case "len":
		return fmt.Sprintf("Panjang %s harus tepat %s karakter", f, p)
	case "nefield":
		return fmt.Sprintf("%s harus berbeda dari %s", f, fieldLabel(p))
	case "alphanum_ascii":
		return fmt.Sprintf("%s hanya boleh mengandung huruf dan angka", f)
	case "gpa":
		return fmt.Sprintf("Nilai %s harus berupa angka desimal di antara rentang 0.00 hingga 4.00", f)
	case "highschool_gpa":
		return fmt.Sprintf("Nilai %s harus berupa angka desimal di antara rentang 0.00 hingga 100.00", f)
	default:
		return fmt.Sprintf("%s tidak valid (%s)", f, fe.Tag())
	}
}

// INFO: This is reserved in case to split concern between NIK and passport
// func IsAllDigits(s string) bool {
// 	for i := 0; i < len(s); i++ {
// 		if s[i] < '0' || s[i] > '9' {
// 			return false
// 		}
// 	}
// 	return true
// }
