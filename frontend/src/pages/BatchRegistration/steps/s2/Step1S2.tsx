"use client";

/* ================= COMPONENTS ================= */
import ProgressBar from "@/pages/BatchRegistration/components/ProgressBar";
import InputField from "@/pages/BatchRegistration/components/InputField";
import SelectField from "@/pages/BatchRegistration/components/SelectField";
import AutocompleteField from "@/components/AutocompleteField";

/* ================= HOOKS ================= */
import useUniversitySearch from "@/pages/BatchRegistration/hooks/useUniversitySearch";
import { useMaxBirthDate } from "@/pages/BatchRegistration/hooks/useMaxBirthDate";
import { useFormErrorHandler } from "@/pages/BatchRegistration/hooks/useFormErrorHandler";
import useProgramStudiOptions from "@/pages/BatchRegistration/hooks/useProgramStudiOptions";

/* ================= CONSTANTS ================= */
import {
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

/* ================= FORM TYPE ================= */
type FormType = z.infer<typeof s2Step1Schema>;

export default function Step1S2({
  data,
  onResult,
  goToStep,
  currentStep,
  flow,
  isSubmitting,
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
  } = methods;

  const onSubmit = (values: FormType) => {
    onResult({ action: "next", data: values });
  };

  const { onError } = useFormErrorHandler({ setFocus: methods.setFocus });

  const maxDate = useMaxBirthDate();
  const university = useUniversitySearch();
  const { options: prodiOptions } = useProgramStudiOptions("S2");

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit, onError)}>
        <div className="formContainer">
          <div className="formWrapper">

            {/* ================= HEADER ================= */}
            <div className="formHeader">
              <h1 className="titleMain">
                FORM PENDAFTARAN CALON MAHASISWA PROGRAM STRATA DUA
              </h1>
              <p className="titleSub">
                (Postgraduate Student Registration Form)
              </p>

              <ProgressBar
                currentStep={currentStep}
                goToStep={goToStep}
                steps={flow}
                isSubmitting={isSubmitting}
              />
            </div>

            {/* ================= BIODATA PRIBADI ================= */}
            <div className="sectionHeader">
              <h2 className="titleMain">
                BIODATA PRIBADI (Personal Data)
              </h2>

              <p className="requiredNote">
                * Wajib di Isi (Required)
              </p>
            </div>

            {/* 1. NIK — kept inline: digit sanitize */}
            <div className="formGroup">
              <label className="label">
                NIK (National Identification Number) * (16 digit)
              </label>

              <input
                {...register("nik")}
                className={`input ${errors.nik ? "inputError" : ""}`}
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
                <p className="errorText">{errors.nik.message}</p>
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
            <div className="formRow">
              <div className="formCol">
                <InputField<FormType>
                  label="Tempat Lahir (Place of Birth)"
                  name="tempatlahir"
                  register={register}
                  errors={errors}
                  placeholder="Masukkan kota kelahiran"
                  required
                />
              </div>

              <div className="formCol">
                <div className="formGroup">
                  <label className="label">
                    Tanggal Lahir (Date of Birth)
                  </label>
                  <input
                    {...register("tanggallahir")}
                    type="date"
                    className={`input ${errors.tanggallahir ? "inputError" : ""}`}
                    max={maxDate}
                  />
                  {errors.tanggallahir && (
                    <p className="errorText">
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
            <div className="formGroup">
              <label className="label">
                No. Telepon (Phone Number)
              </label>

              <input
                {...register("nohp")}
                className={`input ${errors.nohp ? "inputError" : ""}`}
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
                <p className="errorText">{errors.nohp.message}</p>
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
            <h3 className="titleSection">
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
            <div className="formRow">
              <div className="formCol">
                <InputField<FormType>
                  label="Nama Dusun (Hamlet Name)"
                  name="namadusun"
                  register={register}
                  errors={errors}
                  placeholder="Masukkan nama dusun (opsional)"
                />
              </div>

              <div className="formCol">
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
            <div className="formRow">
              <div className="formCol">
                <InputField<FormType>
                  label="No RT"
                  name="nort"
                  register={register}
                  errors={errors}
                  placeholder="Contoh: 001"
                />
              </div>

              <div className="formCol">
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
            <div className="formRow">
              <div className="formCol">
                <InputField<FormType>
                  label="Kelurahan (Sub District)"
                  name="kelurahan"
                  register={register}
                  errors={errors}
                  placeholder="Masukkan kelurahan"
                  required
                />
              </div>

              <div className="formCol">
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
            <h3 className="titleSection">
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
              styles={{
                formGroup: "formGroup",
                label: "label",
                input: "input",
                inputError: "inputError",
                errorText: "errorText",
                dropdown: "dropdown",
                option: "option",
                optionDisabled: "optionDisabled",
                notFound: "notFound",
              }}
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
            <div className="formGroup">
              <label className="label">
                IPK (GPA) * (0.00 - 4.00)
              </label>
              <input
                {...register("ipk", { valueAsNumber: true })}
                type="number"
                step="0.01"
                min={0}
                max={4}
                className={`input ${errors.ipk ? "inputError" : ""}`}
                placeholder="Contoh: 3.45"
              />
              {errors.ipk && (
                <p className="errorText">{errors.ipk.message}</p>
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
            <h3 className="titleSection">
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
            <h3 className="titleSection">
              Informasi Perkuliahan (Post-graduate Program)
            </h3>

            {/* 26. PROGRAM STUDI */}
            <SelectField<FormType>
              label="Program Studi Pilihan (Selected Study Program)"
              name="prodipil"
              register={register}
              errors={errors}
              options={prodiOptions}
              placeholder="Pilih Program Studi (Select Study Program) *"
              required
            />

            {/* ================= BUTTON ================= */}
            <div className="buttonGroup">
              <button
                type="button"
                className="btn btnDanger"
                onClick={() =>
                  onResult({ action: "prev" })
                }
                disabled={isSubmitting}
              >
                Batal (Cancel)
              </button>

              <button
                type="submit"
                className="btn btnPrimary"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
              >
                {isSubmitting
                  ? "Memproses..."
                  : "Selanjutnya (Next)"}
              </button>
            </div>

          </div>
        </div>
      </form>
    </FormProvider>
  );
}