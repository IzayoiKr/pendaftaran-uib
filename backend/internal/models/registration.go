package models

import (
	"encoding/json"
	"html"
	"strings"
)

type RegistrationInitDTO struct {
	BatchName       string          `json:"batch_name"`
	Degree          string          `json:"degree"`
	BatchType       string          `json:"batch_type"`
	Programs        json.RawMessage `json:"programs"`
	RegistrationFee json.RawMessage `json:"registration_fee"`
}

type RegistrationForm struct {
	JenisDaftar    string `json:"jenisdaftar" validate:"omitempty,oneof=BARU ALIH_JENJANG TRANSFER"`
	Gender         string `json:"gender" validate:"omitempty,oneof=L P"`
	Citizenship    string `json:"citizenship" validate:"omitempty,oneof=WNI WNA STATELESS"`
	BirthPlace     string `json:"birthPlace" validate:"omitempty,max=100"`
	BirthDate      string `json:"birthDate" validate:"omitempty,datetime=2006-01-02"`
	PhoneNumber    string `json:"phoneNumber" validate:"omitempty,e164"`
	WhatsappNumber string `json:"whatsappNumber" validate:"omitempty,e164"`

	PreviousUniversity string `json:"previousUniversity" validate:"omitempty,max=150"`
	PreviousMajor      string `json:"previousMajor" validate:"omitempty,max=100"`
	Gpa                string `json:"gpa" validate:"omitempty,gpa"`
	HighestEducation   string `json:"highestEducation" validate:"omitempty,max=50"`
	SchoolOrigin       string `json:"schoolOrigin" validate:"omitempty,max=100"`
	MajorChoice        string `json:"majorChoice" validate:"omitempty,max=100"`
	WaktuKuliah        string `json:"waktuKuliah" validate:"omitempty,max=50"`
	HighschoolGpa      string `json:"highschoolGpa" validate:"omitempty,highschool_gpa"`
	HighschoolGraduateYear string `json:"highschoolGraduateYear" validate:"omitempty,numeric,len=4"`
	Confirmation       bool   `json:"confirmation"`

	ContactEmail     string `json:"contactEmail" validate:"omitempty,email,max=320"`
	Religion         string `json:"religion" validate:"omitempty,max=50"`
	FundingSource    string `json:"fundingSource" validate:"omitempty,max=50"`
	Address          string `json:"address" validate:"omitempty,max=500"`
	SubDistrict      string `json:"subDistrict" validate:"omitempty,max=100"`
	District         string `json:"district" validate:"omitempty,max=100"`
	Hamlet           string `json:"hamlet" validate:"omitempty,max=100"`
	PostalCode       string `json:"postalCode" validate:"omitempty,numeric,max=12"`
	Rt               string `json:"rt" validate:"omitempty,numeric,max=5"`
	Rw               string `json:"rw" validate:"omitempty,numeric,max=5"`
	TaxID            string `json:"taxId" validate:"omitempty,max=20"`
	Reference        string `json:"reference" validate:"omitempty,max=255"`
	ExpertField      string `json:"expertField" validate:"omitempty,max=150"`
	Degree           string `json:"degree" validate:"omitempty,max=50"`
	CompanyName      string `json:"companyName" validate:"omitempty,max=150"`
	CompanyAddress   string `json:"companyAddress" validate:"omitempty,max=500"`
	Position         string `json:"position" validate:"omitempty,max=100"`
	CompanyStatus    string `json:"companyStatus" validate:"omitempty,max=50"`
	CompanyStartYear string `json:"companyStartYear" validate:"omitempty,numeric,len=4"`

	FatherName       string `json:"fatherName" validate:"omitempty,max=255"`
	FatherPhone      string `json:"fatherPhone" validate:"omitempty,e164"`
	FatherNik        string `json:"fatherNik" validate:"omitempty,numeric,max=20"`
	FatherBirthdate  string `json:"fatherBirthdate" validate:"omitempty,datetime=2006-01-02"`
	FatherEducation  string `json:"fatherEducation" validate:"omitempty,max=50"`
	FatherOccupation string `json:"fatherOccupation" validate:"omitempty,max=50"`
	FatherIncome     string `json:"fatherIncome" validate:"omitempty,max=50"`
	FatherStatus     string `json:"fatherStatus" validate:"omitempty,max=50"`

	MotherName       string `json:"motherName" validate:"omitempty,max=255"`
	MotherPhone      string `json:"motherPhone" validate:"omitempty,e164"`
	MotherNik        string `json:"motherNik" validate:"omitempty,numeric,max=20"`
	MotherBirthdate  string `json:"motherBirthdate" validate:"omitempty,datetime=2006-01-02"`
	MotherEducation  string `json:"motherEducation" validate:"omitempty,max=50"`
	MotherOccupation string `json:"motherOccupation" validate:"omitempty,max=50"`
	MotherIncome     string `json:"motherIncome" validate:"omitempty,max=50"`
	MotherStatus     string `json:"motherStatus" validate:"omitempty,max=50"`

	ParentsAddress string `json:"parentsAddress" validate:"omitempty,max=500"`
	Pernyataan     bool   `json:"pernyataan"`

	Pp                 string `json:"pp" validate:"omitempty,max=255"`
	Ktp                string `json:"ktp" validate:"omitempty,max=255"`
	Kk                 string `json:"kk" validate:"omitempty,max=255"`
	TranskripNilai     string `json:"transkripNilai" validate:"omitempty,max=255"`
	IjazahDok          string `json:"ijazahDok" validate:"omitempty,max=255"`
	SktmKip            string `json:"sktmKip" validate:"omitempty,max=255"`
	FotoRumah          string `json:"fotoRumah" validate:"omitempty,max=255"`
	TagihanListrik     string `json:"tagihanListrik" validate:"omitempty,max=255"`
	TagihanAir         string `json:"tagihanAir" validate:"omitempty,max=255"`
	SertifikatPrestasi string `json:"sertifikatPrestasi" validate:"omitempty,max=255"`
	Rapot1             string `json:"rapot1" validate:"omitempty,max=255"`
	Rapot2             string `json:"rapot2" validate:"omitempty,max=255"`
	Rapot3             string `json:"rapot3" validate:"omitempty,max=255"`
	Rapot4             string `json:"rapot4" validate:"omitempty,max=255"`
	Al                 string `json:"al" validate:"omitempty,max=255"`
	R1                 string `json:"r1" validate:"omitempty,max=255"`
	R2                 string `json:"r2" validate:"omitempty,max=255"`

	AccountHolder string `json:"accountHolder" validate:"omitempty,max=255"`
	Bank          string `json:"bank" validate:"omitempty,max=100"`
	PaymentProof  string `json:"paymentProof" validate:"omitempty,max=255"`
}

type RegistrationStatusResponse struct {
	Status    string            `json:"status"`
	DraftData *RegistrationForm `json:"draft_data,omitempty"`
}

func (f *RegistrationForm) Sanitize() {
	f.JenisDaftar    = strings.TrimSpace(f.JenisDaftar)
	f.Gender         = strings.TrimSpace(f.Gender)
	f.Citizenship    = strings.TrimSpace(f.Citizenship)
	f.BirthPlace     = html.EscapeString(strings.TrimSpace(f.BirthPlace))
	f.BirthDate      = strings.TrimSpace(f.BirthDate)
	f.PhoneNumber    = strings.TrimSpace(f.PhoneNumber)
	f.WhatsappNumber = strings.TrimSpace(f.WhatsappNumber)

	f.PreviousUniversity = html.EscapeString(strings.TrimSpace(f.PreviousUniversity))
	f.PreviousMajor      = html.EscapeString(strings.TrimSpace(f.PreviousMajor))
	f.Gpa                = strings.TrimSpace(f.Gpa)
	f.HighestEducation   = strings.TrimSpace(f.HighestEducation)
	f.SchoolOrigin       = html.EscapeString(strings.TrimSpace(f.SchoolOrigin))
	f.MajorChoice        = strings.TrimSpace(f.MajorChoice)
	f.WaktuKuliah        = strings.TrimSpace(f.WaktuKuliah)
	f.HighschoolGpa      = strings.TrimSpace(f.HighschoolGpa)
	f.HighschoolGraduateYear = strings.TrimSpace(f.HighschoolGraduateYear)

	f.ContactEmail  = strings.ToLower(strings.TrimSpace(f.ContactEmail))
	f.Religion      = strings.TrimSpace(f.Religion)
	f.FundingSource = strings.TrimSpace(f.FundingSource)
	f.Address       = html.EscapeString(strings.TrimSpace(f.Address))
	f.SubDistrict   = html.EscapeString(strings.TrimSpace(f.SubDistrict))
	f.District      = html.EscapeString(strings.TrimSpace(f.District))
	f.Hamlet        = html.EscapeString(strings.TrimSpace(f.Hamlet))
	f.PostalCode    = strings.TrimSpace(f.PostalCode)
	f.Rt            = strings.TrimSpace(f.Rt)
	f.Rw            = strings.TrimSpace(f.Rw)

	f.TaxID            = strings.TrimSpace(f.TaxID)
	f.Reference        = html.EscapeString(strings.TrimSpace(f.Reference))
	f.ExpertField      = html.EscapeString(strings.TrimSpace(f.ExpertField))
	f.Degree           = html.EscapeString(strings.TrimSpace(f.Degree))
	f.CompanyName      = html.EscapeString(strings.TrimSpace(f.CompanyName))
	f.CompanyAddress   = html.EscapeString(strings.TrimSpace(f.CompanyAddress))
	f.Position         = html.EscapeString(strings.TrimSpace(f.Position))
	f.CompanyStatus    = strings.TrimSpace(f.CompanyStatus)
	f.CompanyStartYear = strings.TrimSpace(f.CompanyStartYear)

	f.FatherName       = html.EscapeString(strings.TrimSpace(f.FatherName))
	f.FatherPhone      = strings.TrimSpace(f.FatherPhone)
	f.FatherNik        = strings.TrimSpace(f.FatherNik)
	f.FatherBirthdate  = strings.TrimSpace(f.FatherBirthdate)
	f.FatherEducation  = strings.TrimSpace(f.FatherEducation)
	f.FatherOccupation = strings.TrimSpace(f.FatherOccupation)
	f.FatherIncome     = strings.TrimSpace(f.FatherIncome)
	f.FatherStatus     = strings.TrimSpace(f.FatherStatus)

	f.MotherName       = html.EscapeString(strings.TrimSpace(f.MotherName))
	f.MotherPhone      = strings.TrimSpace(f.MotherPhone)
	f.MotherNik        = strings.TrimSpace(f.MotherNik)
	f.MotherBirthdate  = strings.TrimSpace(f.MotherBirthdate)
	f.MotherEducation  = strings.TrimSpace(f.MotherEducation)
	f.MotherOccupation = strings.TrimSpace(f.MotherOccupation)
	f.MotherIncome     = strings.TrimSpace(f.MotherIncome)
	f.MotherStatus     = strings.TrimSpace(f.MotherStatus)

	f.ParentsAddress   = html.EscapeString(strings.TrimSpace(f.ParentsAddress))

	f.Pp                 = strings.TrimSpace(f.Pp)
	f.Ktp                = strings.TrimSpace(f.Ktp)
	f.Kk                 = strings.TrimSpace(f.Kk)
	f.TranskripNilai     = strings.TrimSpace(f.TranskripNilai)
	f.IjazahDok          = strings.TrimSpace(f.IjazahDok)
	f.SktmKip            = strings.TrimSpace(f.SktmKip)
	f.FotoRumah          = strings.TrimSpace(f.FotoRumah)
	f.TagihanListrik     = strings.TrimSpace(f.TagihanListrik)
	f.TagihanAir         = strings.TrimSpace(f.TagihanAir)
	f.SertifikatPrestasi = strings.TrimSpace(f.SertifikatPrestasi)
	f.Rapot1             = strings.TrimSpace(f.Rapot1)
	f.Rapot2             = strings.TrimSpace(f.Rapot2)
	f.Rapot3             = strings.TrimSpace(f.Rapot3)
	f.Rapot4             = strings.TrimSpace(f.Rapot4)
	f.Al                 = strings.TrimSpace(f.Al)
	f.R1                 = strings.TrimSpace(f.R1)
	f.R2                 = strings.TrimSpace(f.R2)

	f.AccountHolder = html.EscapeString(strings.TrimSpace(f.AccountHolder))
	f.Bank          = html.EscapeString(strings.TrimSpace(f.Bank))
	f.PaymentProof  = strings.TrimSpace(f.PaymentProof)
}
