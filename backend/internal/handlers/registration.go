package handlers

import (
	"database/sql"
	"fmt"
	"log/slog"
	"net/http"
	"path/filepath"
	"strings"

	"pendaftaran-uib/backend/internal/audit"
	"pendaftaran-uib/backend/internal/auth"
	"pendaftaran-uib/backend/internal/utils"
)

func RegisterStudent(db *sql.DB, al *audit.Logger) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		claims := auth.GetClaims(r)
		if claims == nil {
			utils.WriteJSON(w, http.StatusUnauthorized, utils.ErrJSON("unauthorized"))
			return
		}

		if err := r.ParseMultipartForm(10 << 20); err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON("Failed to parse form data"))
			return
		}

		for _, fileHeaders := range r.MultipartForm.File {
			for _, header := range fileHeaders {
				if header.Size > 2<<20 {
					utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON("File "+header.Filename+" exceeds 2MB limit."))
					return
				}

				ext := strings.ToLower(filepath.Ext(header.Filename))
				if ext != ".pdf" {
					utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON("File "+header.Filename+" must be a PDF."))
					return
				}
			}
		}

		nama := strings.TrimSpace(r.FormValue("nama"))
		nik := strings.TrimSpace(r.FormValue("nik"))

		registrationKey := r.FormValue("registrationKey")
		batchName := r.FormValue("batchName")
		isS2 := strings.HasPrefix(strings.ToLower(registrationKey), "s2") || strings.HasPrefix(strings.ToLower(registrationKey), "magister")

		idBytes, err := utils.UUIDToBytes(claims.UserID)
		if err != nil {
			slog.Error("registration: parse uuid to bytes", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
			return
		}

		// Check for existing registration
		var existingID string
		tableName := "s1_registrations"
		if isS2 {
			tableName = "s2_registrations"
		}
		checkQuery := fmt.Sprintf("SELECT id FROM %s WHERE user_id = ? AND registration_key = ?", tableName)
		err = db.QueryRowContext(r.Context(), checkQuery, idBytes, registrationKey).Scan(&existingID)
		if err == nil {
			utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON("Anda sudah terdaftar di gelombang ini. (You are already registered for this batch)"))
			return
		} else if err != sql.ErrNoRows {
			slog.Error("Failed to check existing registration", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("Failed to process registration"))
			return
		}

		registrationID, err := GenerateNewRegistrationID(r.Context(), db, registrationKey, isS2)
		if err != nil {
			slog.Error("Failed to generate registration ID", "error", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("Failed to generate registration ID"))
			return
		}

		folderName := registrationID

		uploadFile := func(field string) string {
			file, header, err := r.FormFile(field)
			if err != nil {
				return ""
			}
			defer file.Close()

			path, err := utils.SaveUploadedFile(file, header, filepath.Join("uploads", "registrations", folderName, "registration"))
			if err != nil {
				slog.Error("Failed to save file", "field", field, "error", err)
				return ""
			}
			return path
		}

		emptyToNil := func(s string) any {
			if s == "" {
				return nil
			}
			return s
		}

		if isS2 {
			// S2 Extraction
			pasFotoPath := uploadFile("pp") // Matches payload
			ktpPath := uploadFile("ktp")
			kkPath := uploadFile("kk")
			buktiBayarPath := uploadFile("buktibayar")
			aktaLahirPath := uploadFile("al")
			ijazahS1Path := uploadFile("r1")
			transkripS1Path := uploadFile("r4")

			_, err := db.ExecContext(r.Context(), `
				INSERT INTO s2_registrations
				(id, user_id, registration_key, batch_name, nik, nama, jk, kewarganegaraan, tempat_lahir, tanggal_lahir, email, no_hp, agama, sumber_studi, alamat, kelurahan, kecamatan, jurusan, ipk, gelar, nama_ayah, notelp_ayah, nama_ibu, notelp_ibu, pas_foto_path, ktp_path, kk_path, bukti_bayar_path, akta_lahir_path, ijazah_s1_path, transkrip_s1_path, pemilik_rek, bank)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
				registrationID, idBytes, registrationKey, batchName, nik, nama, r.FormValue("jk"), r.FormValue("kewarganegaraan"), r.FormValue("tempatlahir"), r.FormValue("tanggallahir"), r.FormValue("email"), r.FormValue("nohp"), r.FormValue("agama"), r.FormValue("sumber_studi"), r.FormValue("alamat"), r.FormValue("kelurahan"), r.FormValue("kecamatan"), r.FormValue("jurusan"), emptyToNil(r.FormValue("ipk")), r.FormValue("gelar"), r.FormValue("nama_ayah"), r.FormValue("notelp_ayah"), r.FormValue("nama_ibu"), r.FormValue("notelp_ibu"), pasFotoPath, ktpPath, kkPath, buktiBayarPath, aktaLahirPath, ijazahS1Path, transkripS1Path, r.FormValue("pemilikrek"), r.FormValue("bank"),
			)

			if err != nil {
				slog.Error("Failed to insert S2 registration", "error", err)
				utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(err.Error()))
				return
			}
		} else {
			// S1 Extraction
			pasFotoPath := uploadFile("pp") // Matches payload
			ktpPath := uploadFile("ktp")
			kkPath := uploadFile("kk")
			buktiBayarPath := uploadFile("buktibayar")
			transkripPath := uploadFile("transkrip_nilai")
			ijazahPath := uploadFile("ijazah_dok")

            // Ensure prodipil is not completely empty to avoid silent DB failure
            prodiPil := strings.TrimSpace(r.FormValue("prodipil"))
            if prodiPil == "" {
                utils.WriteJSON(w, http.StatusBadRequest, utils.ErrJSON("Program Studi pilihan (prodipil) tidak boleh kosong."))
                return
            }

			_, err := db.ExecContext(r.Context(), `
				INSERT INTO s1_registrations
				(id, user_id, registration_key, batch_name, nik, email, nama, jk, kewarganegaraan, tempat_lahir, tanggal_lahir, no_hp, no_hp2, jenis_daftar, prodi_pil, prodi_pil2, prodi_pil3, waktu_kuliah, asal_sekolah, pas_foto_path, ktp_path, kk_path, bukti_bayar_path, transkrip_nilai_path, ijazah_path, pemilik_rek, bank, konfirmasi, universitas_asal, prodi_asal, ipk, jenjang_pendidikan)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
				registrationID, idBytes, registrationKey, batchName, nik, r.FormValue("email"), nama, r.FormValue("jk"), r.FormValue("kewarganegaraan"), r.FormValue("tempatlahir"), r.FormValue("tanggallahir"), r.FormValue("nohp"), r.FormValue("nohp2"), r.FormValue("jenisdaftar"), prodiPil, emptyToNil(r.FormValue("prodipil2")), emptyToNil(r.FormValue("prodipil3")), r.FormValue("waktukuliah"), r.FormValue("asal_sekolah"), pasFotoPath, ktpPath, kkPath, buktiBayarPath, transkripPath, ijazahPath, r.FormValue("pemilikrek"), r.FormValue("bank"), r.FormValue("konfirmasi") == "true", emptyToNil(r.FormValue("universitas_asal")), emptyToNil(r.FormValue("prodi_asal")), emptyToNil(r.FormValue("ipk")), emptyToNil(r.FormValue("jenjang_pendidikan")),
			)

			if err != nil {
				slog.Error("Failed to insert S1 registration", "error", err)
				utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON(err.Error()))
				return
			}
		}

		utils.WriteJSON(w, http.StatusOK, map[string]string{
			"message": "Registration submitted successfully",
			"id":      registrationID,
		})
	}
}
