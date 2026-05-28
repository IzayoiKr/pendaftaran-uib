package models

type ProgramStudiOptions struct {
	Title string `json:"title"`
	TitleEN string `json:"title_en"`
}

type RegistrationFeeDTO struct {
	Bank          string `json:"bank_name"`
	AccountHolder string `json:"account_holder"`
	AccountNumber string `json:"account_number"`
	Amount        int    `json:"amount"`
}

type RegistrationInitDTO struct {
	BatchName string `json:"batch_name"`
	Degree string `json:"degree"`
	BatchType string `json:"batch_type"`
	Programs []ProgramStudiOptions `json:"programs"`
	RegistrationFee RegistrationFeeDTO `json:"registration_fee"`
}
