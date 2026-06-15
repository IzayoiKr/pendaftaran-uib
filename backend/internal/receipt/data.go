package receipt

import (
	"context"
	"database/sql"
	"fmt"
	"time"
	"strings"
	"github.com/google/uuid"
)

type ReceiptData struct {
	ReceiptNumber string
	PaymentDate   string
	
	StudentName   string
	ExamineeID    string
	BatchName     string
	Degree        string
	
	Amount        uint64
	AmountWords   string
	BankName      string
	AccountHolder string
	
	PaymentPurpose string
}

func LoadReceiptData(ctx context.Context, db *sql.DB, regID uuid.UUID, paymentID uint64) (*ReceiptData, error) {
	var d ReceiptData
	var uploadedAt time.Time
	var batchName, degree string
	var examineeID sql.NullString

	// Fetch student and registration details
	err := db.QueryRowContext(ctx, `
		SELECT 
			u.full_name,
			r.examinee_id,
			g.batch_name,
			g.degree
		FROM registration r
		INNER JOIN users u ON u.id = r.user_id
		INNER JOIN gelombang g ON g.id = r.gelombang_id
		WHERE r.id = ?`,
		regID[:],
	).Scan(&d.StudentName, &examineeID, &batchName, &degree)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("registration not found")
		}
		return nil, err
	}

	d.ExamineeID = examineeID.String
	d.BatchName = batchName
	d.Degree = degree

	// Fetch payment details
	var amountFloat float64
	err = db.QueryRowContext(ctx, `
		SELECT 
			account_holder,
			bank_name,
			amount,
			uploaded_at
		FROM registration_tuition_fee
		WHERE id = ? AND registration_id = ? AND status = 'VERIFIED'`,
		paymentID, regID[:],
	).Scan(&d.AccountHolder, &d.BankName, &amountFloat, &uploadedAt)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("verified payment not found")
		}
		return nil, err
	}

	d.Amount = uint64(amountFloat)

	d.PaymentDate = uploadedAt.Format("02 January 2006")
	d.ReceiptNumber = fmt.Sprintf("ROP/%s/%06d", uploadedAt.Format("20060102"), paymentID)
	d.AmountWords = sayRupiah(d.Amount)
	d.PaymentPurpose = fmt.Sprintf("Pembayaran Biaya Pendaftaran %s %s", d.Degree, d.BatchName)

	return &d, nil
}

// sayRupiah is a simple converter from number to words (Indonesian)
func sayRupiah(n uint64) string {
	if n == 0 {
		return "Nol Rupiah"
	}
	return strings.TrimSpace(sayIndo(n)) + " Rupiah"
}

func sayIndo(n uint64) string {
	units := []string{"", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"}

	switch {
	case n < 12:
		return units[n]
	case n < 20:
		return sayIndo(n-10) + " Belas"
	case n < 100:
		return sayIndo(n/10) + " Puluh " + sayIndo(n%10)
	case n < 200:
		return "Seratus " + sayIndo(n-100)
	case n < 1000:
		return sayIndo(n/100) + " Ratus " + sayIndo(n%100)
	case n < 2000:
		return "Seribu " + sayIndo(n-1000)
	case n < 1000000:
		return sayIndo(n/1000) + " Ribu " + sayIndo(n%1000)
	case n < 1000000000:
		return sayIndo(n/1000000) + " Juta " + sayIndo(n%1000000)
	case n < 1000000000000:
		return sayIndo(n/1000000000) + " Miliar " + sayIndo(n%1000000000)
	default:
		return fmt.Sprintf("%d", n)
	}
}
