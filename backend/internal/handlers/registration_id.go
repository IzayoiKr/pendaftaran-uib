package handlers

import (
	"context"
	"database/sql"
	"fmt"
	"regexp"
	"strings"
	"time"
)

var formattedIDRegex = regexp.MustCompile(`^[A-Z]{2}\d{3}\d{4}$`)

// GetRegistrationID returns the formatted registration number (XXPYUUUU).
// If the provided id is already in the correct format, it returns it as is.
// Otherwise, it computes it based on the registration details.
func GetRegistrationID(ctx context.Context, db *sql.DB, id string, registrationKey string, createdAt time.Time, isS2 bool) (string, error) {
	// 1. Check if id is already formatted
	if formattedIDRegex.MatchString(id) {
		return id, nil
	}

	// 2. Get Gelombang details to form the prefix
	var location, academicYear, batchType string
	err := db.QueryRowContext(ctx, "SELECT location, academic_year, batch_type FROM gelombang WHERE batch_key = ?", registrationKey).
		Scan(&location, &academicYear, &batchType)
	if err != nil {
		// If gelombang info is missing, we can't compute a proper ID.
		// For robustness, return the original ID or a fallback.
		return id, nil
	}

	// 3. Map Location XX
	var xx string
	switch strings.ToLower(location) {
	case "batam":
		xx = "BM"
	case "online":
		xx = "OL"
	case "tanjung pinang":
		xx = "TP"
	default:
		xx = "XX"
	}

	// 4. Extract Period P (e.g., 2026 -> 25)
	p := "25" // Fallback
	re := regexp.MustCompile(`\d{4}`)
	match := re.FindString(academicYear)
	if len(match) == 4 {
		p = match[2:]
	}

	// 5. Map Type Y (Reguler -> 1, Beasiswa -> 2)
	y := "1"
	if strings.ToLower(batchType) == "beasiswa" {
		y = "2"
	}

	// 6. Prefix
	prefix := xx + p + y

	// 7. Calculate Sequence UUUU
	// Sequence is (count of records that strictly come before this one) + 1.
	// We use the primary key (id) to break ties for identical created_at.
	var count int
	tableName := "s1_registrations"
	if isS2 {
		tableName = "s2_registrations"
	}

	query := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM %s
		WHERE id LIKE ? AND (created_at < ? OR (created_at = ? AND id < ?))
	`, tableName)

	err = db.QueryRowContext(ctx, query, prefix+"%", createdAt, createdAt, id).Scan(&count)
	if err != nil {
		return prefix + "0001", nil // Fallback
	}

	return fmt.Sprintf("%s%04d", prefix, count+1), nil
}

// GenerateNewRegistrationID generates a brand new ID for a new registration.
func GenerateNewRegistrationID(ctx context.Context, db *sql.DB, registrationKey string, isS2 bool) (string, error) {
	// Re-use GetRegistrationID logic but with current time and a dummy ID that will come "after" everything
	now := time.Now()
	// Use a very high value for tie-breaking so we get the NEXT sequence
	return GetRegistrationID(ctx, db, "ZZZZZZZZ-ZZZZ-ZZZZ-ZZZZ-ZZZZZZZZZZZZ", registrationKey, now, isS2)
}

// ResolveRegistrationID takes an ID (could be UUID or formatted ID like BM2510001)
// and returns the actual UUID and a boolean indicating if it's S2.
func ResolveRegistrationID(ctx context.Context, db *sql.DB, inputID string, userID []byte) (uuid string, isS2 bool, err error) {
	// 1. If it looks like a UUID (36 chars with dashes), try direct lookup first
	if !formattedIDRegex.MatchString(inputID) {
		// Check S1
		var foundID string
		err = db.QueryRowContext(ctx, "SELECT id FROM s1_registrations WHERE id = ? AND user_id = ?", inputID, userID).Scan(&foundID)
		if err == nil {
			return inputID, false, nil
		}
		// Check S2
		err = db.QueryRowContext(ctx, "SELECT id FROM s2_registrations WHERE id = ? AND user_id = ?", inputID, userID).Scan(&foundID)
		if err == nil {
			return inputID, true, nil
		}
		// If it's not a formatted ID and not found as UUID, return error
		return "", false, fmt.Errorf("registration not found")
	}

	// 2. If it matches the formatted ID pattern, we need to find which UUID it corresponds to.
	// We'll fetch all registrations for this user and check their formatted IDs.

	// Check S1 registrations for this user
	rows, err := db.QueryContext(ctx, "SELECT id, registration_key, created_at FROM s1_registrations WHERE user_id = ?", userID)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var rid, rkey string
			var rca time.Time
			if err := rows.Scan(&rid, &rkey, &rca); err == nil {
				fmtID, _ := GetRegistrationID(ctx, db, rid, rkey, rca, false)
				if fmtID == inputID {
					return rid, false, nil
				}
			}
		}
	}

	// Check S2 registrations for this user
	rowsS2, err := db.QueryContext(ctx, "SELECT id, registration_key, created_at FROM s2_registrations WHERE user_id = ?", userID)
	if err == nil {
		defer rowsS2.Close()
		for rowsS2.Next() {
			var rid, rkey string
			var rca time.Time
			if err := rowsS2.Scan(&rid, &rkey, &rca); err == nil {
				fmtID, _ := GetRegistrationID(ctx, db, rid, rkey, rca, true)
				if fmtID == inputID {
					return rid, true, nil
				}
			}
		}
	}

	return "", false, fmt.Errorf("registration not found")
}
