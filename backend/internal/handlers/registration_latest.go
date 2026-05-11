package handlers

import (
	"database/sql"
	"log/slog"
	"net/http"

	"pendaftaran-uib/backend/internal/auth"
	"pendaftaran-uib/backend/internal/utils"
)

func GetLatestRegistration(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		claims := auth.GetClaims(r)
		if claims == nil {
			utils.WriteJSON(w, http.StatusUnauthorized, utils.ErrJSON("unauthorized"))
			return
		}

		// Try to get latest from S1 first
		var s1Data map[string]interface{}
		row := db.QueryRowContext(r.Context(), `
			SELECT r.nik, r.email, r.nama, r.jk, r.kewarganegaraan, r.tempat_lahir, r.tanggal_lahir, r.no_hp, r.no_hp2, r.waktu_kuliah, r.asal_sekolah, p.title as prodi_pil_name
			FROM s1_registrations r
			JOIN program_studi p ON r.prodi_pil = p.id
			WHERE r.user_id = ?
			ORDER BY r.created_at DESC
			LIMIT 1
		`, claims.UserID)

		var nik, email, nama, jk, kewarganegaraan, tempatLahir, tanggalLahir, noHp, noHp2, waktuKuliah, asalSekolah, prodiPilName string
		err := row.Scan(&nik, &email, &nama, &jk, &kewarganegaraan, &tempatLahir, &tanggalLahir, &noHp, &noHp2, &waktuKuliah, &asalSekolah, &prodiPilName)
		
		if err == nil {
			s1Data = map[string]interface{}{
				"nik":             nik,
				"email":           email,
				"nama":            nama,
				"jk":              jk,
				"kewarganegaraan": kewarganegaraan,
				"tempat_lahir":    tempatLahir,
				"tanggal_lahir":   tanggalLahir,
				"no_hp":           noHp,
				"no_hp2":          noHp2,
				"waktu_kuliah":    waktuKuliah,
				"asal_sekolah":    asalSekolah,
				"prodi_pil_name":  prodiPilName,
			}
		}

		// Try to get latest from S2
		var s2Data map[string]interface{}
		rowS2 := db.QueryRowContext(r.Context(), `
			SELECT nik, nama, jk, kewarganegaraan, tempat_lahir, tanggal_lahir, email, no_hp, agama, sumber_studi, alamat, kelurahan, kecamatan, jurusan, ipk, gelar, nama_ayah, notelp_ayah, nama_ibu, notelp_ibu
			FROM s2_registrations
			WHERE user_id = ?
			ORDER BY created_at DESC
			LIMIT 1
		`, claims.UserID)

		var nik2, nama2, jk2, kewarganegaraan2, tempatLahir2, tanggalLahir2, email2, noHp3, agama, sumberStudi, alamat, kelurahan, kecamatan, jurusan, gelar, namaAyah, noTelpAyah, namaIbu, noTelpIbu string
		var ipk sql.NullFloat64
		errS2 := rowS2.Scan(&nik2, &nama2, &jk2, &kewarganegaraan2, &tempatLahir2, &tanggalLahir2, &email2, &noHp3, &agama, &sumberStudi, &alamat, &kelurahan, &kecamatan, &jurusan, &ipk, &gelar, &namaAyah, &noTelpAyah, &namaIbu, &noTelpIbu)

		if errS2 == nil {
			s2Data = map[string]interface{}{
				"nik":             nik2,
				"nama":            nama2,
				"jk":              jk2,
				"kewarganegaraan": kewarganegaraan2,
				"tempat_lahir":    tempatLahir2,
				"tanggal_lahir":   tanggalLahir2,
				"email":           email2,
				"no_hp":           noHp3,
				"agama":           agama,
				"sumber_studi":    sumberStudi,
				"alamat":          alamat,
				"kelurahan":       kelurahan,
				"kecamatan":       kecamatan,
				"jurusan":         jurusan,
				"ipk":             ipk.Float64,
				"gelar":           gelar,
				"nama_ayah":       namaAyah,
				"notelp_ayah":     noTelpAyah,
				"nama_ibu":        namaIbu,
				"notelp_ibu":      noTelpIbu,
			}
		} else if errS2 != sql.ErrNoRows {
			slog.Error("Failed to scan latest S2 registration", "error", errS2)
		}

		// Combine data, prioritizing S1 if it's more complete for common fields?
		// Actually, let's just return both and let the frontend decide, or merge them.
		// Merging:
		merged := make(map[string]interface{})
		
		// Fill from S2 if exists (usually has more fields)
		if s2Data != nil {
			for k, v := range s2Data {
				merged[k] = v
			}
		}
		
		// Fill/Override from S1 for common fields if S2 doesn't have it or S1 is newer
		// For simplicity, let's just take the absolute latest from either table.
		
		// Let's check which one is newer
		var s1Time, s2Time string
		db.QueryRowContext(r.Context(), "SELECT created_at FROM s1_registrations WHERE user_id = ? ORDER BY created_at DESC LIMIT 1", claims.UserID).Scan(&s1Time)
		db.QueryRowContext(r.Context(), "SELECT created_at FROM s2_registrations WHERE user_id = ? ORDER BY created_at DESC LIMIT 1", claims.UserID).Scan(&s2Time)

		if s1Time > s2Time && s1Data != nil {
			for k, v := range s1Data {
				merged[k] = v
			}
		} else if s2Data != nil {
			// S2 is newer or S1 doesn't exist
			for k, v := range s2Data {
				merged[k] = v
			}
			// But S1 might have no_hp2 which S2 doesn't
			if s1Data != nil {
				if v, ok := s1Data["no_hp2"]; ok {
					merged["no_hp2"] = v
				}
				if v, ok := s1Data["asal_sekolah"]; ok {
					merged["asal_sekolah"] = v
				}
			}
		} else if s1Data != nil {
			// Only S1 exists
			for k, v := range s1Data {
				merged[k] = v
			}
		}

		utils.WriteJSON(w, http.StatusOK, merged)
	}
}
