"use client";

/* ================= STYLES ================= */
import styles from "@/pages/BatchRegistration/styles/Step1.module.scss";
import form from "@/pages/BatchRegistration/styles/Form.module.scss";

/* ================= COMPONENTS ================= */
import ProgressBar from "@/pages/BatchRegistration/components/ProgressBar";
import InputField from "@/pages/BatchRegistration/components/InputField";
import SelectField from "@/pages/BatchRegistration/components/SelectField";
import AutocompleteField from "@/components/AutocompleteField";

/* ================= HOOKS ================= */
import useSchoolSearch from "@/pages/BatchRegistration/hooks/useSchoolSearch";
import useUniversitySearch from "@/pages/BatchRegistration/hooks/useUniversitySearch";
import { useMaxBirthDate } from "@/pages/BatchRegistration/hooks/useMaxBirthDate";

/* ================= CONSTANTS ================= */
import {
  PRODI_S1_OPTIONS,
  JENIS_DAFTAR_OPTIONS,
  JENIS_KELAMIN_OPTIONS,
  KEWARGANEGARAAN_OPTIONS,
  JENJANG_PENDIDIKAN_OPTIONS,
  WAKTU_KULIAH_OPTIONS,
} from "@/constants/registerOptions";

/* ================= TYPES ================= */
import type { StepPropsS1 } from "@/validation/schemaform";

/* ================= VALIDATION ================= */
import { s1Step1Schema } from "@/validation/schemaform";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider, useWatch } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useEffect } from "react";
import { useFormErrorHandler } from "@/pages/BatchRegistration/hooks/useFormErrorHandler";

/* ================= FORM TYPE ================= */
type FormType = z.infer<typeof s1Step1Schema>;

export default function Step1S1({
  data,
  onResult,
  goToStep,
  currentStep,
  flow,
}: StepPropsS1) {
  const methods = useForm<FormType>({
    resolver: zodResolver(s1Step1Schema),
    defaultValues: data,
  });

  useEffect(() => {
    if (!data) return;

    methods.reset(data, {
      keepValues: true,
    });
  }, [data, methods]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = methods;

  const onSubmit = (values: FormType) => {
    toast.success("Data berhasil disimpan");
    onResult({ action: "next", data: values });
  };

  const { onError } = useFormErrorHandler({ setFocus: methods.setFocus });

  const jenisDaftar = useWatch<FormType>({
    control: methods.control,
    name: "jenisdaftar",
  });

  const isAlihjenjangOrTransfer =
    jenisDaftar === "alihjenjang" || jenisDaftar === "transfer";

    useEffect(() => {
      if (!isAlihjenjangOrTransfer) {

        methods.setValue("ipk", undefined as any);
        methods.setValue("universitas_asal", "");
        methods.setValue("prodi_asal", "");
        methods.setValue("jenjang_pendidikan", undefined as any);
      }
    }, [isAlihjenjangOrTransfer, methods]);

  const maxDate = useMaxBirthDate();
  const school = useSchoolSearch();
  const university = useUniversitySearch();

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit, onError)}>
        <div className={styles.container}>
          <div className={styles.formWrapper}>

            {/* ================= HEADER ================= */}
            <div className={styles.header}>
              <h1 className={styles.mainTitle}>
                FORM PENDAFTARAN CALON MAHASISWA PROGRAM STRATA SATU
              </h1>
              <p className={styles.subTitle}>
                (Undergraduate Student Registration Form)
              </p>

              <ProgressBar
                currentStep={currentStep}
                goToStep={goToStep}
                steps={flow}
              />
            </div>

            {/* ================= TITLE ================= */}
            <div className={styles.sectionHeader}>
              <h2 className={styles.pageTitle}>
                BIODATA PRIBADI (Personal Data)
              </h2>

              <p className={styles.requiredNote}>
                * Wajib di Isi (Required)
              </p>
            </div>

            {/* NIK — kept inline: digit sanitize + setValue */}
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

            {/* EMAIL */}
            <InputField<FormType>
              label="Email"
              name="email"
              type="email"
              register={register}
              errors={errors}
              placeholder="Contoh: nama@email.com"
              required
            />

            {/* NAMA */}
            <InputField<FormType>
              label="Nama Lengkap (Full Name)"
              name="nama"
              register={register}
              errors={errors}
              placeholder="Masukkan nama lengkap Anda"
              required
            />

            {/* JENIS KELAMIN */}
            <SelectField<FormType>
              label="Jenis Kelamin (Gender)"
              name="jk"
              register={register}
              errors={errors}
              options={JENIS_KELAMIN_OPTIONS}
              placeholder="Pilih Jenis Kelamin (Select Gender) *"
              required
            />

            {/* KEWARGANEGARAAN */}
            <SelectField<FormType>
              label="Kewarganegaraan (Nationality)"
              name="kewarganegaraan"
              register={register}
              errors={errors}
              options={KEWARGANEGARAAN_OPTIONS}
              placeholder="Pilih Kewarganegaraan (Select Nationality) *"
              required
            />

            {/* TEMPAT & TANGGAL LAHIR */}
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
                    Tanggal Lahir (Date of Birth) *
                  </label>

                  <input
                    {...register("tanggallahir")}
                    className={`${form.input} ${errors.tanggallahir ? form.inputError : ""}`}
                    type="date"
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

            {/* NO HP — kept inline: digit sanitize */}
            <div className={form.formGroup}>
              <label className={form.label}>
                No. Hp (First Phone Number) *
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

            {/* NO WA — kept inline: digit sanitize */}
            <div className={form.formGroup}>
              <label className={form.label}>
                No. WA (WhatsApp Number) *
              </label>

              <input
                {...register("nohp2")}
                className={`${form.input} ${errors.nohp2 ? form.inputError : ""}`}
                type="text"
                inputMode="numeric"
                placeholder="Contoh: 08123456789"
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 15);
                  setValue("nohp2", value, {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                }}
              />

              {errors.nohp2 && (
                <p className={form.errorText}>{errors.nohp2.message}</p>
              )}
            </div>

            {/* JENIS PENDAFTARAN */}
            <SelectField<FormType>
              label="Jenis Pendaftaran (Registration Type)"
              name="jenisdaftar"
              register={register}
              errors={errors}
              options={JENIS_DAFTAR_OPTIONS}
              placeholder="Pilih Jenis Pendaftaran (Select Registration Type) *"
              required
            />
            <p style={{ color: "red", fontSize: 12 }}>
  DEBUG jenis: "{String(jenisDaftar)}"
</p>

            {/* DATA PENDIDIKAN SEBELUMNYA — hanya muncul jika Alih Jenjang atau Transfer */}
            {isAlihjenjangOrTransfer && (
              <div className={form.extraBox}>
                <h3>Data Pendidikan Sebelumnya (Previous Education Data)</h3>

                {/* UNIVERSITAS ASAL */}
                <AutocompleteField<FormType>
                  label="Universitas Asal (Last University) *"
                  name="universitas_asal"
                  query={university.query}
                  setQuery={university.setQuery}
                  open={university.open}
                  setOpen={university.setOpen}
                  filtered={university.filtered}
                  setValue={setValue}
                  error={errors.universitas_asal?.message}
                  placeholder="Ketik nama universitas (min. 2 huruf)..."
                  styles={form}
                />

                {/* ASAL PROGRAM STUDI */}
                <InputField<FormType>
                  label="Asal Program Studi (Last Study Program)"
                  name="prodi_asal"
                  register={register}
                  errors={errors}
                  placeholder="Masukkan nama program studi"
                  required
                />

                {/* IPK — kept inline: valueAsNumber */}
                <div className={form.formGroup}>
                  <label className={form.label}>
                    IPK (GPA) * (0.00 - 4.00)
                  </label>

                  <input
                    {...register("ipk", { valueAsNumber: true })}
                    className={`${form.input} ${errors.ipk ? form.inputError : ""}`}
                    type="number"
                    step="0.01"
                    min={0}
                    max={4}
                    placeholder="Contoh: 3.45"
                  />

                  {errors.ipk && (
                    <p className={form.errorText}>{errors.ipk.message}</p>
                  )}
                </div>

                {/* JENJANG PENDIDIKAN */}
                <SelectField<FormType>
                  label="Jenjang Pendidikan Terakhir (Last Education Level)"
                  name="jenjang_pendidikan"
                  register={register}
                  errors={errors}
                  options={JENJANG_PENDIDIKAN_OPTIONS}
                  placeholder="Pilih Jenjang Pendidikan *"
                  required
                />
              </div>
            )}

            {/* ===== INFORMASI PERKULIAHAN ===== */}
            <h3 className={styles.sectionTitle}>
              Informasi Perkuliahan (Study Program)
            </h3>

            {/* PROGRAM STUDI PILIHAN 1 */}
            <SelectField<FormType>
              label="Program Studi Pilihan (First Selected Study Program)"
              name="prodipil"
              register={register}
              errors={errors}
              options={PRODI_S1_OPTIONS}
              placeholder="Pilih Program Studi Pilihan *"
              required
            />

            {/* PROGRAM STUDI PILIHAN 2 */}
            <SelectField<FormType>
              label="Program Studi Pilihan 2 (Second Selected Study Program)"
              name="prodipil2"
              register={register}
              errors={errors}
              options={PRODI_S1_OPTIONS}
              placeholder="Pilih Program Studi Pilihan 2"
            />

            {/* PROGRAM STUDI PILIHAN 3 */}
            <SelectField<FormType>
              label="Program Studi Pilihan 3 (Third Selected Study Program)"
              name="prodipil3"
              register={register}
              errors={errors}
              options={PRODI_S1_OPTIONS}
              placeholder="Pilih Program Studi Pilihan 3"
            />

            {/* WAKTU KULIAH */}
            <SelectField<FormType>
              label="Waktu Kuliah (Shift)"
              name="waktukuliah"
              register={register}
              errors={errors}
              options={WAKTU_KULIAH_OPTIONS}
              placeholder="Pilih Waktu Kuliah (Select Shift) *"
              required
            />

            {/* ===== INFORMASI SEKOLAH ===== */}
            <h3 className={styles.sectionTitle}>
              Informasi Sekolah (High School Information)
            </h3>

            {/* NAMA SEKOLAH */}
            <AutocompleteField<FormType>
              label="Nama Asal Sekolah (Name of High School) *"
              name="asal_sekolah"
              query={school.query}
              setQuery={school.setQuery}
              open={school.open}
              setOpen={school.setOpen}
              filtered={school.filtered}
              setValue={setValue}
              error={errors.asal_sekolah?.message}
              placeholder="Ketik nama sekolah..."
              styles={form}
            />

            {/* CHECKBOX — hanya muncul saat "baru" */}
            {jenisDaftar === "baru" && (
              <div className={form.extraBox}>
                <label className={form.checkbox}>
                  <input
                    type="checkbox"
                    {...register("konfirmasi")}
                  />
                  Dengan ini saya menyatakan bahwa saya siswa yang belum pernah
                  mengikuti perkuliahan pada perguruan tinggi lain.
                </label>

                {errors.konfirmasi && (
                  <p className={form.errorText}>
                    {errors.konfirmasi.message}
                  </p>
                )}
              </div>
            )}

            {/* BUTTON */}
            <div className={form.buttonGroup}>
              <button
                type="button"
                className={`${form.btn} ${form.btnDanger}`}
                onClick={() => onResult({ action: "prev" })}
              >
                Batal
              </button>

              <button
                type="submit"
                className={`${form.btn} ${form.btnPrimary}`}
              >
                Selanjutnya
              </button>
            </div>

          </div>
        </div>
      </form>
    </FormProvider>
  );
}