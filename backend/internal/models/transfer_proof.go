package models

import (
	"html"
	"strings"
	"time"

	"github.com/google/uuid"
)

type TransferProof struct {
	ID             uint64     `json:"id"`
	RegistrationID uuid.UUID  `json:"registration_id"`
	Status         string     `json:"status"`
	AccountHolder  string     `json:"account_holder"`
	BankName       string     `json:"bank_name"`
	Amount         uint64     `json:"amount"`
	FilePath       string     `json:"file_path"`
	FileName       string     `json:"file_name"`
	FileSizeBytes  uint64     `json:"file_size_bytes"`
	PaymentDate    time.Time  `json:"payment_date"`
	UploadedAt     time.Time  `json:"uploaded_at"`
}

type TransferProofDTO struct {
	RegistrationID uuid.UUID `json:"registration_id"`
	AccountHolder  string    `json:"account_holder"`
	BankName       string    `json:"bank_name"`
	Amount         uint64    `json:"amount"`
	Status         string    `json:"status"`
	FileName       string    `json:"file_name"`
	PaymentDate    string    `json:"payment_date"`
	UploadedAt     string    `json:"uploaded_at"`
}

type TransferProofRequest struct {
	AccountHolder string `json:"accountHolder" validate:"required,max=255"`
	BankName      string `json:"bankName" validate:"required,max=100"`
	Amount        uint64 `json:"amount" validate:"required,numeric"`
	PaymentDate   string `json:"paymentDate" validate:"required,datetime=2006-01-02"`
}

func (r *TransferProofRequest) Sanitize() {
	r.AccountHolder = html.EscapeString(strings.TrimSpace(r.AccountHolder))
	r.BankName = html.EscapeString(strings.TrimSpace(r.BankName))
	r.PaymentDate = strings.TrimSpace(r.PaymentDate)
}
