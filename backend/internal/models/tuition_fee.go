package models

import "time"

type TuitionFee struct {
	ID              uint64     `json:"id"`
	RegistrationID  string     `json:"registration_id"`
	Status          string     `json:"status"`
	AccountHolder   string     `json:"pemilik_rekening"`
	BankName        string     `json:"bank"`
	Amount          uint64     `json:"amount"`
	FilePath        string     `json:"bukti_bayar_path"`
	FileName        string     `json:"file_name"`
	FileSizeBytes   uint32     `json:"file_size_bytes"`
	PaymentDate     string     `json:"payment_date"`
	UploadedAt      time.Time  `json:"created_at"`
}
