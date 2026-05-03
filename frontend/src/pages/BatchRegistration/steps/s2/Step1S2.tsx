"use client";

/* ================= UI STYLES ================= */
import styles from "@/pages/BatchRegistration/styles/Step1.module.scss";
import form from "@/pages/BatchRegistration/styles/Form.module.scss";

/* ================= COMPONENTS ================= */
import ProgressBar from "@/pages/BatchRegistration/components/ProgressBar";
import InputField from "@/pages/BatchRegistration/components/InputField";
import SelectField from "@/pages/BatchRegistration/components/SelectField";
import AutocompleteField from "@/components/AutocompleteField";

/* ================= HOOKS ================= */
import useUniversitySearch from "@/pages/BatchRegistration/hooks/useUniversitySearch";
import { useMaxBirthDate } from "@/pages/BatchRegistration/hooks/useMaxBirthDate";

/* ================= CONSTANTS ================= */
import {
  PRODI_S2_OPTIONS,
  JENIS_KELAMIN_OPTIONS,
  KEWARGANEGARAAN_OPTIONS,
  AGAMA_OPTIONS,
  SUMBER_BIAYA_OPTIONS,
  STATUS_INSTANSI_OPTIONS,
  TAHUN_KERJA_OPTIONS,
} from "@/constants/registerOptions";

/* ================= TYPES ================= */
import type { StepPropsS2 } from "@/validation/schemaform";

/* ================= VALIDATION ================= */
import { s2Step1Schema } from "@/validation/schemaform";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import type { FieldErrors } from "react-hook-form";

/* ================= FORM TYPE ================= */
type FormType = z.infer<typeof s2Step1Schema>;

export default function Step1S2({
  data,
  onResult,
  goToStep,
  currentStep,
  flow,
}: StepPropsS2) {
  const methods = useForm<FormType>({
    resolver: zodResolver(s2Step1Schema),
    defaultValues: data,
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    setFocus,
  } = methods;

  const onSubmit = (values: FormType) => {
    onResult({ action: "next", data: values });
  };

  const onError = (errors: FieldErrors<FormType>) => {
    console.log("FORM ERROR:", errors);
    toast.error("Form belum lengkap. Periksa kembali input Anda.");
    const firstError = Object.keys(errors)[0];
    if (firstError) {
      setFocus(firstError as any);
    }
  };

  const maxDate = useMaxBirthDate();
  const university = useUniversitySearch();

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit, onError)}>
        <div className={styles.container}>
          <div className={styles.formWrapper}>

            {/* ================= HEADER ================= */}
            <div className={styles.header}>
              <h1 className={styles.mainTitle}>
                FORM PENDAFTARAN CALON MAHASISWA PROGRAM STRATA DUA
              </h1>
              <p className={styles.subTitle}>
                (Postgraduate Student Registration Form)
              </p>

              <ProgressBar
                currentStep={currentStep}
                goToStep={goToStep}
                steps={flow}
              />
            </div>

            {/* ================= BIODATA PRIBADI ================= */}
            <div className={styles.sectionHeader}>
              <h2 className={styles.pageTitle}>
                BIODATA PRIBADI (Personal Data)
              </h2>

              <p className={styles.requiredNote}>
                * Wajib di Isi (Required)
              </p>
            </div>

            {/* 1. NIK — kept inline: digit sanitize */}
            <div className={form.formGroup}>
              <label className={form.label}>
                NIK (National Identification Number) * (16 digit)
              </label>

              <input
                {...register("nik")}
                className={`${form.input} ${errors.nik ? form.inputError : ""}`}
                inputMode="numeric"
                maxLength={16}
                placeholder="Contoh: 1234567890123456"
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 16);
                  setValue("nik", value, {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                }}
              />

              {errors.nik && (
                <p className={form.errorText}>{errors.nik.message}</p>
              )}
            </div>

            {/* 2. NAMA */}
            <InputField<FormType>
              label="Nama Lengkap (Full Name)"
              name="nama"
              register={register}
              errors={errors}
              placeholder="Masukkan nama lengkap Anda"
              required
            />

            {/* 3. JENIS KELAMIN */}
            <SelectField<FormType>
              label="Jenis Kelamin (Gender)"
              name="jk"
              register={register}
              errors={errors}
              options={JENIS_KELAMIN_OPTIONS}
              placeholder="Pilih Jenis Kelamin (Select Gender) *"
              required
            />

            {/* 4. KEWARGANEGARAAN */}
            <SelectField<FormType>
              label="Kewarganegaraan (Nationality)"
              name="kewarganegaraan"
              register={register}
              errors={errors}
              options={KEWARGANEGARAAN_OPTIONS}
              placeholder="Pilih Kewarganegaraan (Select Nationality) *"
              required
            />

            {/* 5. TEMPAT & TANGGAL LAHIR */}
            <div className={form.row}>
              <div className={form.col}>
                <InputField<FormType>
                  label="Tempat Lahir (Place of Birth)"
                  name="tempatlahir"
                  register={register}
                  errors={errors}
                  placeholder="Masukkan kota kelahiran"
                  required
                />
              </div>

              <div className={form.col}>
                <div className={form.formGroup}>
                  <label className={form.label}>
                    Tanggal Lahir (Date of Birth)
                  </label>
                  <input
                    {...register("tanggallahir")}
                    type="date"
                    className={`${form.input} ${errors.tanggallahir ? form.inputError : ""}`}
                    max={maxDate}
                  />
                  {errors.tanggallahir && (
                    <p className={form.errorText}>
                      {errors.tanggallahir.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 6. NPWP */}
            <InputField<FormType>
              label="NPWP (Tax Identification Number)"
              name="npwp"
              register={register}
              errors={errors}
              placeholder="Masukkan No. NPWP (opsional)"
            />

            {/* 7. EMAIL */}
            <InputField<FormType>
              label="Email"
              name="email"
              type="email"
              register={register}
              errors={errors}
              placeholder="Contoh: nama@email.com"
              required
            />

            {/* 8. NO HP — kept inline: digit sanitize */}
            <div className={form.formGroup}>
              <label className={form.label}>
                No. Telepon (Phone Number)
              </label>

              <input
                {...register("nohp")}
                className={`${form.input} ${errors.nohp ? form.inputError : ""}`}
                type="text"
                inputMode="numeric"
                placeholder="Contoh: 08123456789"
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 15);
                  setValue("nohp", value, {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                }}
              />

              {errors.nohp && (
                <p className={form.errorText}>{errors.nohp.message}</p>
              )}
            </div>

            {/* 9. AGAMA */}
            <SelectField<FormType>
              label="Agama (Religion)"
              name="agama"
              register={register}
              errors={errors}
              options={AGAMA_OPTIONS}
              placeholder="Pilih Agama (Select Religion) *"
              required
            />

            {/* 10. REFERENSI */}
            <InputField<FormType>
              label="Referensi / Rekomendasi (Reference / Recommendation)"
              name="referensi"
              register={register}
              errors={errors}
              placeholder="Nama referensi atau pemberi rekomendasi (opsional)"
            />

            {/* 11. KEAHLIAN */}
            <InputField<FormType>
              label="Bidang Keahlian (Field of Expertise)"
              name="keahlian"
              register={register}
              errors={errors}
              placeholder="Masukkan bidang keahlian (opsional)"
            />

            {/* 12. SUMBER BIAYA STUDI */}
            <SelectField<FormType>
              label="Sumber Biaya Studi (Source of Study Funding)"
              name="sumber_studi"
              register={register}
              errors={errors}
              options={SUMBER_BIAYA_OPTIONS}
              placeholder="Pilih Sumber Biaya Studi *"
              required
            />

            {/* ================= TEMPAT TINGGAL ================= */}
            <h3 className={styles.sectionTitle}>
              Tempat Tinggal (Residence)
            </h3>

            {/* 13. ALAMAT */}
            <InputField<FormType>
              label="Alamat (Street Address)"
              name="alamat"
              register={register}
              errors={errors}
              placeholder="Masukkan alamat lengkap"
              required
            />

            {/* 14. NAMA DUSUN & KODE POS */}
            <div className={form.row}>
              <div className={form.col}>
                <InputField<FormType>
                  label="Nama Dusun (Hamlet Name)"
                  name="namadusun"
                  register={register}
                  errors={errors}
                  placeholder="Masukkan nama dusun (opsional)"
                />
              </div>

              <div className={form.col}>
                <InputField<FormType>
                  label="Kode Pos (Postal Code)"
                  name="kodepost"
                  register={register}
                  errors={errors}
                  placeholder="Contoh: 29444"
                  maxLength={5}
                  inputMode="numeric"
                />
              </div>
            </div>

            {/* 15. NO RT & NO RW */}
            <div className={form.row}>
              <div className={form.col}>
                <InputField<FormType>
                  label="No RT"
                  name="nort"
                  register={register}
                  errors={errors}
                  placeholder="Contoh: 001"
                />
              </div>

              <div className={form.col}>
                <InputField<FormType>
                  label="No RW"
                  name="norw"
                  register={register}
                  errors={errors}
                  placeholder="Contoh: 003"
                />
              </div>
            </div>

            {/* 16. KELURAHAN & KECAMATAN */}
            <div className={form.row}>
              <div className={form.col}>
                <InputField<FormType>
                  label="Kelurahan (Sub District)"
                  name="kelurahan"
                  register={register}
                  errors={errors}
                  placeholder="Masukkan kelurahan"
                  required
                />
              </div>

              <div className={form.col}>
                <InputField<FormType>
                  label="Kecamatan (District)"
                  name="kecamatan"
                  register={register}
                  errors={errors}
                  placeholder="Masukkan kecamatan"
                  required
                />
              </div>
            </div>

            {/* ================= INFORMASI ASAL UNIVERSITAS ================= */}
            <h3 className={styles.sectionTitle}>
              Informasi Asal Universitas (Previous University Information)
            </h3>

            {/* 17. UNIVERSITAS — autocomplete */}
            <AutocompleteField<FormType>
              label="Nama Universitas Asal (Name of University)"
              name="universitas"
              query={university.query}
              setQuery={university.setQuery}
              open={university.open}
              setOpen={university.setOpen}
              filtered={university.filtered}
              setValue={setValue}
              error={errors.universitas?.message}
              placeholder="Ketik nama universitas (min. 2 huruf)..."
              styles={form}
            />

            {/* 18. JURUSAN */}
            <InputField<FormType>
              label="Jurusan (Major / Department)"
              name="jurusan"
              register={register}
              errors={errors}
              placeholder="Masukkan nama jurusan"
              required
            />

            {/* 19. IPK — kept inline: valueAsNumber */}
            <div className={form.formGroup}>
              <label className={form.label}>
                IPK (GPA) * (0.00 - 4.00)
              </label>
              <input
                {...register("ipk", { valueAsNumber: true })}
                type="number"
                step="0.01"
                min={0}
                max={4}
                className={`${form.input} ${errors.ipk ? form.inputError : ""}`}
                placeholder="Contoh: 3.45"
              />
              {errors.ipk && (
                <p className={form.errorText}>{errors.ipk.message}</p>
              )}
            </div>

            {/* 20. GELAR */}
            <InputField<FormType>
              label="Gelar (Academic Degree)"
              name="gelar"
              register={register}
              errors={errors}
              placeholder="Contoh: S.Kom, S.E., S.T."
              required
            />

            {/* ================= INFORMASI PEKERJAAN ================= */}
            <h3 className={styles.sectionTitle}>
              Informasi Pekerjaan (Employment Information)
            </h3>

            {/* 21. NAMA PERUSAHAAN */}
            <InputField<FormType>
              label="Nama Perusahaan / Instansi (Company / Institution Name)"
              name="perusahaan_nama"
              register={register}
              errors={errors}
              placeholder="Masukkan nama perusahaan atau instansi (opsional)"
            />

            {/* 22. ALAMAT INSTANSI */}
            <InputField<FormType>
              label="Alamat Perusahaan / Instansi (Company Address)"
              name="alamat_instansi"
              register={register}
              errors={errors}
              placeholder="Masukkan alamat perusahaan (opsional)"
            />

            {/* 23. JABATAN */}
            <InputField<FormType>
              label="Jabatan (Job Title / Position)"
              name="jabatan"
              register={register}
              errors={errors}
              placeholder="Masukkan jabatan atau posisi (opsional)"
            />

            {/* 24. STATUS INSTANSI */}
            <SelectField<FormType>
              label="Status Instansi (Institution Status)"
              name="status_instansi"
              register={register}
              errors={errors}
              options={STATUS_INSTANSI_OPTIONS}
              placeholder="Pilih Status Instansi (opsional)"
            />

            {/* 25. TAHUN MULAI BEKERJA */}
            <SelectField<FormType>
              label="Tahun Mulai Bekerja (Year Started Working)"
              name="tahun_perusahaan"
              register={register}
              errors={errors}
              options={TAHUN_KERJA_OPTIONS}
              placeholder="Pilih Tahun (opsional)"
            />

            {/* ================= INFORMASI PERKULIAHAN ================= */}
            <h3 className={styles.sectionTitle}>
              Informasi Perkuliahan (Post-graduate Program)
            </h3>

            {/* 26. PROGRAM STUDI */}
            <SelectField<FormType>
              label="Program Studi Pilihan (Selected Study Program)"
              name="prodipil"
              register={register}
              errors={errors}
              options={PRODI_S2_OPTIONS}
              placeholder="Pilih Program Studi (Select Study Program) *"
              required
            />

            {/* ================= BUTTON ================= */}
            <div className={form.buttonGroup}>
              <button
                type="button"
                className={`${form.btn} ${form.btnDanger}`}
                onClick={() => onResult({ action: "prev" })}
              >
                Batal (Cancel)
              </button>

              <button
                type="submit"
                className={`${form.btn} ${form.btnPrimary}`}
              >
                Selanjutnya (Next)
              </button>
            </div>

          </div>
        </div>
      </form>
    </FormProvider>
  );
}