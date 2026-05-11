package handlers

import (
	"database/sql"
	"log/slog"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"pendaftaran-uib/backend/internal/auth"
	"pendaftaran-uib/backend/internal/utils"
)

func GetRegistrationDetails(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		claims := auth.GetClaims(r)
		if claims == nil {
			utils.WriteJSON(w, http.StatusUnauthorized, utils.ErrJSON("unauthorized"))
			return
		}

		regID := chi.URLParam(r, "id")
		if regID == "" {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON("missing registration id"))
			return
		}

		resolvedID, isS2, err := ResolveRegistrationID(r.Context(), db, claims.UserID, regID)
		if err != nil {
			utils.WriteJSON(w, http.StatusNotFound, utils.ErrJSON("registration not found"))
			return
		}

		if !isS2 {
			// S1 Logic
			var s1Data map[string]interface{}
			rows, err := db.QueryContext(r.Context(), `
				SELECT r.nik, r.email, r.nama, r.jk, r.kewarganegaraan, r.tempat_lahir, r.tanggal_lahir, r.no_hp, r.no_hp2, r.jenis_daftar, r.prodi_pil, p.title as prodi_pil_name, r.prodi_pil2, r.prodi_pil3, r.waktu_kuliah, r.asal_sekolah, r.konfirmasi, r.universitas_asal, r.prodi_asal, r.ipk, r.jenjang_pendidikan, r.registration_key, r.batch_name, r.doc_check_status, r.payment_status, r.doc_check_notes, r.payment_notes, g.usm_password
				FROM s1_registrations r
				JOIN program_studi p ON r.prodi_pil = p.id
				LEFT JOIN gelombang g ON r.registration_key = g.batch_key
				WHERE r.id = ? AND r.user_id = ?
			`, resolvedID, claims.UserID)

			if err == nil && rows.Next() {
				var nik, email, nama, jk, kewarganegaraan, tempatLahir, tanggalLahir, noHp, noHp2, jenisDaftar, prodiPil, prodiPilName, waktuKuliah, asalSekolah, regKey, batchName, docStatus, payStatus string
				var usmPass, docNotes, payNotes sql.NullString
				var konfirmasi bool
				var p2, p3, univAsal, prodiAsal, jenjangPend sql.NullString
				var ipk sql.NullFloat64

				err = rows.Scan(&nik, &email, &nama, &jk, &kewarganegaraan, &tempatLahir, &tanggalLahir, &noHp, &noHp2, &jenisDaftar, &prodiPil, &prodiPilName, &p2, &p3, &waktuKuliah, &asalSekolah, &konfirmasi, &univAsal, &prodiAsal, &ipk, &jenjangPend, &regKey, &batchName, &docStatus, &payStatus, &docNotes, &payNotes, &usmPass)
				rows.Close()
				if err == nil {
					// Fetch payments
					var payments []map[string]interface{}
					payRows, err := db.QueryContext(r.Context(), `
						SELECT id, pemilik_rekening, bank, bukti_bayar_path, status, validation_date, created_at, updated_at
						FROM registration_payments
						WHERE registration_id = ?
						ORDER BY created_at DESC
					`, resolvedID)
					if err == nil {
						defer payRows.Close()
						for payRows.Next() {
							var pid, powner, pbank, ppath, pstatus string
							var vdate sql.NullTime
							var cat, uat time.Time
							if err := payRows.Scan(&pid, &powner, &pbank, &ppath, &pstatus, &vdate, &cat, &uat); err == nil {
								p := map[string]interface{}{
									"id":                pid,
									"pemilik_rekening":  powner,
									"bank":              pbank,
									"bukti_bayar_path":  ppath,
									"status":            pstatus,
									"created_at":        cat,
									"updated_at":        uat,
								}
								if vdate.Valid {
									p["validation_date"] = vdate.Time
								}
								payments = append(payments, p)
							}
						}
					}

					s1Data = map[string]interface{}{
						"type":                "S1",
						"nik":                 nik,
						"email":               email,
						"nama":                nama,
						"jk":                  jk,
						"kewarganegaraan":     kewarganegaraan,
						"tempat_lahir":        tempatLahir,
						"tanggal_lahir":       tanggalLahir,
						"no_hp":               noHp,
						"no_hp2":              noHp2,
						"jenis_daftar":        jenisDaftar,
						"prodi_pil":           prodiPil,
						"prodi_pil_name":      prodiPilName,
						"prodi_pil2":          p2.String,
						"prodi_pil3":          p3.String,
						"waktu_kuliah":        waktuKuliah,
						"asal_sekolah":        asalSekolah,
						"konfirmasi":          konfirmasi,
						"universitas_asal":    univAsal.String,
						"prodi_asal":          prodiAsal.String,
						"ipk":                 ipk.Float64,
						"jenjang_pendidikan":  jenjangPend.String,
						"registrationKey":     regKey,
						"batchName":           batchName,
						"doc_check_status":    docStatus,
						"payment_status":      payStatus,
						"doc_check_notes":     docNotes.String,						"payment_notes":       payNotes.String,
						"usm_password":        usmPass.String,
						"payments":            payments,
					}
					utils.WriteJSON(w, http.StatusOK, s1Data)
					return
				} else {
					slog.Error("Failed to scan S1 registration", "error", err, "resolvedID", resolvedID)
				}
			}
			if rows != nil {
				rows.Close()
			}
		} else {
			// S2 Logic
			var s2Data map[string]interface{}
			rowsS2, err := db.QueryContext(r.Context(), `
				SELECT r.nik, r.nama, r.jk, r.kewarganegaraan, r.tempat_lahir, r.tanggal_lahir, r.email, r.no_hp, r.agama, r.sumber_studi, r.alamat, r.kelurahan, r.kecamatan, r.jurusan, r.ipk, r.gelar, r.nama_ayah, r.notelp_ayah, r.nama_ibu, r.notelp_ibu, r.registration_key, r.batch_name, r.waktu_kuliah, r.doc_status, r.payment_status, r.doc_notes, r.payment_notes, g.usm_password
				FROM s2_registrations r
				LEFT JOIN gelombang g ON r.registration_key = g.batch_key
				WHERE r.id = ? AND r.user_id = ?
			`, resolvedID, claims.UserID)

			if err == nil && rowsS2.Next() {
				var nik, nama, jk, kewarganegaraan, tempatLahir, tanggalLahir, email, noHp, agama, sumberStudi, alamat, kelurahan, kecamatan, jurusan, gelar, namaAyah, noTelpAyah, namaIbu, noTelpIbu, regKey, batchName, waktuKuliah, docStatus, payStatus string
				var usmPass, docNotes, payNotes sql.NullString
				var ipk sql.NullFloat64

				err = rowsS2.Scan(&nik, &nama, &jk, &kewarganegaraan, &tempatLahir, &tanggalLahir, &email, &noHp, &agama, &sumberStudi, &alamat, &kelurahan, &kecamatan, &jurusan, &ipk, &gelar, &namaAyah, &noTelpAyah, &namaIbu, &noTelpIbu, &regKey, &batchName, &waktuKuliah, &docStatus, &payStatus, &docNotes, &payNotes, &usmPass)
				rowsS2.Close()
				if err == nil {
					// Fetch payments
					var payments []map[string]interface{}
					payRows, err := db.QueryContext(r.Context(), `
						SELECT id, pemilik_rekening, bank, bukti_bayar_path, status, validation_date, created_at, updated_at
						FROM registration_payments
						WHERE registration_id = ?
						ORDER BY created_at DESC
					`, resolvedID)
					if err == nil {
						defer payRows.Close()
						for payRows.Next() {
							var pid, powner, pbank, ppath, pstatus string
							var vdate sql.NullTime
							var cat, uat time.Time
							if err := payRows.Scan(&pid, &powner, &pbank, &ppath, &pstatus, &vdate, &cat, &uat); err == nil {
								p := map[string]interface{}{
									"id":                pid,
									"pemilik_rekening":  powner,
									"bank":              pbank,
									"bukti_bayar_path":  ppath,
									"status":            pstatus,
									"created_at":        cat,
									"updated_at":        uat,
								}
								if vdate.Valid {
									p["validation_date"] = vdate.Time
								}
								payments = append(payments, p)
							}
						}
					}

					s2Data = map[string]interface{}{
						"type":                "S2",
						"nik":                 nik,
						"nama":                nama,
						"jk":                  jk,
						"kewarganegaraan":     kewarganegaraan,
						"tempat_lahir":        tempatLahir,
						"tanggal_lahir":       tanggalLahir,
						"email":               email,
						"no_hp":               noHp,
						"agama":               agama,
						"sumber_studi":        sumberStudi,
						"alamat":              alamat,
						"kelurahan":           kelurahan,
						"kecamatan":           kecamatan,
						"jurusan":             jurusan,
						"ipk":                 ipk.Float64,
						"gelar":               gelar,
						"nama_ayah":           namaAyah,
						"notelp_ayah":         noTelpAyah,
						"nama_ibu":            namaIbu,
						"notelp_ibu":          noTelpIbu,
						"registrationKey":     regKey,
						"batchName":           batchName,
						"waktu_kuliah":        waktuKuliah,
						"doc_check_status":    docStatus,
						"payment_status":      payStatus,
						"doc_check_notes":     docNotes.String,
						"payment_notes":       payNotes.String,
						"usm_password":        usmPass.String,
						"payments":            payments,
					}
					utils.WriteJSON(w, http.StatusOK, s2Data)
					return
				} else {
					slog.Error("Failed to scan S2 registration", "error", err, "resolvedID", resolvedID)
				}
			}

			if rowsS2 != nil {
				rowsS2.Close()
			}
		}

		utils.WriteJSON(w, http.StatusNotFound, utils.ErrJSON("registration not found"))
	}
}

func UpdateRegistration(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		claims := auth.GetClaims(r)
		if claims == nil {
			utils.WriteJSON(w, http.StatusUnauthorized, utils.ErrJSON("unauthorized"))
			return
		}

		regID := chi.URLParam(r, "id")
		if regID == "" {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON("missing registration id"))
			return
		}

		resolvedID, isS2, err := ResolveRegistrationID(r.Context(), db, claims.UserID, regID)
		if err != nil {
			utils.WriteJSON(w, http.StatusNotFound, utils.ErrJSON("registration not found"))
			return
		}

		if err := r.ParseMultipartForm(10 << 20); err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON("Failed to parse form data"))
			return
		}

		if !isS2 {
			// Update S1
			emptyToNil := func(s string) any {
				if s == "" {
					return nil
				}
				return s
			}

			_, err := db.ExecContext(r.Context(), `
				UPDATE s1_registrations SET
					nik = ?, email = ?, nama = ?, jk = ?, kewarganegaraan = ?, tempat_lahir = ?, tanggal_lahir = ?, 
					no_hp = ?, no_hp2 = ?, jenis_daftar = ?, prodi_pil = ?, prodi_pil2 = ?, prodi_pil3 = ?, 
					waktu_kuliah = ?, asal_sekolah = ?, konfirmasi = ?, universitas_asal = ?, prodi_asal = ?, 
					ipk = ?, jenjang_pendidikan = ?
				WHERE id = ? AND user_id = ?
			`,
				r.FormValue("nik"), r.FormValue("email"), r.FormValue("nama"), r.FormValue("jk"), r.FormValue("kewarganegaraan"),
				r.FormValue("tempatlahir"), r.FormValue("tanggallahir"), r.FormValue("nohp"), r.FormValue("nohp2"),
				r.FormValue("jenisdaftar"), r.FormValue("prodipil"), emptyToNil(r.FormValue("prodipil2")), emptyToNil(r.FormValue("prodipil3")),
				r.FormValue("waktukuliah"), r.FormValue("asal_sekolah"), r.FormValue("konfirmasi") == "true",
				emptyToNil(r.FormValue("universitas_asal")), emptyToNil(r.FormValue("prodi_asal")), emptyToNil(r.FormValue("ipk")), emptyToNil(r.FormValue("jenjang_pendidikan")),
				resolvedID, claims.UserID,
			)
			if err != nil {
				slog.Error("Failed to update S1 registration", "error", err, "resolvedID", resolvedID)
				utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("failed to update registration"))
				return
			}
		} else {
			// Update S2
			emptyToNil := func(s string) any {
				if s == "" {
					return nil
				}
				return s
			}

			_, err := db.ExecContext(r.Context(), `
				UPDATE s2_registrations SET
					nik = ?, nama = ?, jk = ?, kewarganegaraan = ?, tempat_lahir = ?, tanggal_lahir = ?, 
					email = ?, no_hp = ?, agama = ?, sumber_studi = ?, alamat = ?, kelurahan = ?, kecamatan = ?, 
					jurusan = ?, ipk = ?, gelar = ?, nama_ayah = ?, notelp_ayah = ?, nama_ibu = ?, notelp_ibu = ?
				WHERE id = ? AND user_id = ?
			`,
				r.FormValue("nik"), r.FormValue("nama"), r.FormValue("jk"), r.FormValue("kewarganegaraan"),
				r.FormValue("tempatlahir"), r.FormValue("tanggallahir"), r.FormValue("email"), r.FormValue("nohp"),
				r.FormValue("agama"), r.FormValue("sumber_studi"), r.FormValue("alamat"), r.FormValue("kelurahan"),
				r.FormValue("kecamatan"), r.FormValue("jurusan"), emptyToNil(r.FormValue("ipk")), r.FormValue("gelar"),
				r.FormValue("nama_ayah"), r.FormValue("notelp_ayah"), r.FormValue("nama_ibu"), r.FormValue("notelp_ibu"),
				resolvedID, claims.UserID,
			)
			if err != nil {
				slog.Error("Failed to update S2 registration", "error", err, "resolvedID", resolvedID)
				utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("failed to update registration"))
				return
			}
		}

		utils.WriteJSON(w, http.StatusOK, map[string]string{"message": "Registration updated successfully"})
	}
}
