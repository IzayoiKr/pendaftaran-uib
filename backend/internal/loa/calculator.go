package loa

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/google/uuid"
)

var (
	ErrRegistrationNotFound = errors.New("registration not found")
	ErrFeeNotConfigured     = errors.New("fee configuration not found")
	ErrInvalidAssessment    = errors.New("invalid assessment data")
)

type S1FeeBreakdown struct {
	SPP          int
	PPL          int
	BPPPokok     int
	BPPSKS       int
	BPPPraktikum int

	DiscountSPP      int
	DiscountPPL      int
	DiscountBPPPokok int
	DiscountBPPSKS   int

	TotalBefore   int
	TotalDiscount int
	TotalPayable  int

	ScholarshipName string
}

func CalculateS1Fee(ctx context.Context, db *sql.DB, regID uuid.UUID) (*S1FeeBreakdown, error) {
	var prodiID uuid.UUID
	var gelombangNumber int
	var usmRank sql.NullInt64
	var scholarshipID sql.NullInt64

	err := db.QueryRowContext(ctx, `
		SELECT
			s1.program_studi_id,
			g.batch_number,
			a.usm_rank,
			a.scholarship_id
		FROM registration r
		INNER JOIN gelombang g ON g.id = r.gelombang_id
		INNER JOIN registration_s1_detail s1 ON s1.registration_id = r.id
		LEFT  JOIN registration_s1_assessment a ON a.registration_id = r.id
		WHERE r.id = ? AND r.status = 'VERIFIED'`,
		regID[:],
	).Scan(&prodiID, &gelombangNumber, &usmRank, &scholarshipID)

	if err == sql.ErrNoRows {
		return nil, ErrRegistrationNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("lookup registration: %w", err)
	}

	if !usmRank.Valid {
		return nil, fmt.Errorf("%w: usm_rank not set", ErrInvalidAssessment)
	}

	var bppPokok, perSKS, basePPL, labFee int
	err = db.QueryRowContext(ctx, `
		SELECT bpp_pokok, per_sks_cost, base_ppl, lab_fee
		FROM master_s1_prodi_fee
		WHERE program_studi_id = ?`,
		prodiID[:],
	).Scan(&bppPokok, &perSKS, &basePPL, &labFee)
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("%w: prodi fee not configured for this program", ErrFeeNotConfigured)
	}
	if err != nil {
		return nil, fmt.Errorf("prodi fee lookup: %w", err)
	}

	var sppAmount int
	err = db.QueryRowContext(ctx, `
		SELECT spp_amount
		FROM master_s1_spp_matrix
		WHERE gelombang_number = ? AND usm_rank = ?`,
		gelombangNumber, usmRank.Int64,
	).Scan(&sppAmount)
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("%w: spp matrix entry not found (gelombang=%d, rank=%d)",
			ErrFeeNotConfigured, gelombangNumber, usmRank.Int64)
	}
	if err != nil {
		return nil, fmt.Errorf("spp matrix lookup: %w", err)
	}

	const defaultSKS = 20
	bppSKS := perSKS * defaultSKS

	var discSPPPct, discPPLPct, discBPPPct, discSKSPct float64
	var scholarshipName string

	if scholarshipID.Valid {
		err = db.QueryRowContext(ctx, `
			SELECT name, spp_discount_pct, ppl_discount_pct, bpp_discount_pct, sks_discount_pct
			FROM master_s1_scholarship
			WHERE id = ?`,
			scholarshipID.Int64,
		).Scan(&scholarshipName, &discSPPPct, &discPPLPct, &discBPPPct, &discSKSPct)
		if err != nil && err != sql.ErrNoRows {
			return nil, fmt.Errorf("scholarship lookup: %w", err)
		}
	}

	dSPP := int(float64(sppAmount) * discSPPPct / 100)
	dPPL := int(float64(basePPL) * discPPLPct / 100)
	dBPP := int(float64(bppPokok) * discBPPPct / 100)
	dSKS := int(float64(bppSKS) * discSKSPct / 100)

	totalBefore := sppAmount + basePPL + bppPokok + bppSKS + labFee
	totalDiscount := dSPP + dPPL + dBPP + dSKS
	totalPayable := totalBefore - totalDiscount

	return &S1FeeBreakdown{
		SPP:          sppAmount,
		PPL:          basePPL,
		BPPPokok:     bppPokok,
		BPPSKS:       bppSKS,
		BPPPraktikum: labFee,

		DiscountSPP:      dSPP,
		DiscountPPL:      dPPL,
		DiscountBPPPokok: dBPP,
		DiscountBPPSKS:   dSKS,

		TotalBefore:   totalBefore,
		TotalDiscount: totalDiscount,
		TotalPayable:  totalPayable,

		ScholarshipName: scholarshipName,
	}, nil
}

func StoreFeeS1(ctx context.Context, tx *sql.Tx, regID uuid.UUID, f *S1FeeBreakdown) error {
	_, err := tx.ExecContext(ctx, `
		INSERT INTO registration_loa_fee
			(registration_id, spp_charged, ppl_charged, bpp_charged, sks_charged, lab_charged)
		VALUES (?, ?, ?, ?, ?, ?)
		ON DUPLICATE KEY UPDATE
			spp_charged = VALUES(spp_charged),
			ppl_charged = VALUES(ppl_charged),
			bpp_charged = VALUES(bpp_charged),
			sks_charged = VALUES(sks_charged),
			lab_charged = VALUES(lab_charged),
			updated_at  = NOW()`,
		regID[:],
		f.SPP-f.DiscountSPP,
		f.PPL-f.DiscountPPL,
		f.BPPPokok-f.DiscountBPPPokok,
		f.BPPSKS-f.DiscountBPPSKS,
		f.BPPPraktikum,
	)
	return err
}

type S2FeeBreakdown struct {
	PackageName      string
	TotalTuition     int
	MatriculationFee int
	IsMatriculation  bool
	Semester1        int
	Semester2        int
	Semester3        int
	TotalPayable     int
}

type installmentSchedule struct {
	Semester1 int `json:"semester_1"`
	Semester2 int `json:"semester_2"`
	Semester3 int `json:"semester_3"`
}

func CalculateS2Fee(ctx context.Context, db *sql.DB, regID uuid.UUID) (*S2FeeBreakdown, error) {
	var packageID int
	var isMatriculation bool

	err := db.QueryRowContext(ctx, `
		SELECT a.s2_package_id, a.is_matriculation_required
		FROM registration r
		INNER JOIN registration_s2_assessment a ON a.registration_id = r.id
		WHERE r.id = ? AND r.status = 'VERIFIED'`,
		regID[:],
	).Scan(&packageID, &isMatriculation)

	if err == sql.ErrNoRows {
		return nil, ErrRegistrationNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("lookup s2 assessment: %w", err)
	}

	var packageName string
	var totalTuition, matriculationFee int
	var scheduleJSON string

	err = db.QueryRowContext(ctx, `
		SELECT category_name, total_tuition, matriculation_fee, installment_schedule
		FROM master_s2_package
		WHERE id = ?`,
		packageID,
	).Scan(&packageName, &totalTuition, &matriculationFee, &scheduleJSON)
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("%w: s2 package not found", ErrFeeNotConfigured)
	}
	if err != nil {
		return nil, fmt.Errorf("s2 package lookup: %w", err)
	}

	var sched installmentSchedule
	if err := json.Unmarshal([]byte(scheduleJSON), &sched); err != nil {
		return nil, fmt.Errorf("parse installment schedule: %w", err)
	}

	totalPayable := totalTuition
	if isMatriculation {
		totalPayable += matriculationFee
	}

	return &S2FeeBreakdown{
		PackageName:      packageName,
		TotalTuition:     totalTuition,
		MatriculationFee: matriculationFee,
		IsMatriculation:  isMatriculation,
		Semester1:        sched.Semester1,
		Semester2:        sched.Semester2,
		Semester3:        sched.Semester3,
		TotalPayable:     totalPayable,
	}, nil
}
