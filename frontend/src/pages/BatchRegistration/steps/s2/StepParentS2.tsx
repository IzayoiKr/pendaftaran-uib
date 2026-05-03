"use client";

/* ================= UI STYLES ================= */
import styles from "@/pages/BatchRegistration/styles/Step1.module.scss";
import form from "@/pages/BatchRegistration/styles/Form.module.scss";

/* ================= COMPONENTS ================= */
import ProgressBar from "@/pages/BatchRegistration/components/ProgressBar";
import SelectField from "@/pages/BatchRegistration/components/SelectField";

/* ================= HOOKS ================= */
import { useMaxBirthDate } from "@/pages/BatchRegistration/hooks/useMaxBirthDate";

/* ================= CONSTANTS ================= */
import {
  STATUS_ORANG_TUA_OPTIONS,
} from "@/constants/registerOptions";

import {
  PARENT_SECTIONS,
  EXTRA_FIELDS,
  PARENT_SELECT_FIELDS,
} from "@/constants/parentFormConfig";

/* ================= TYPES ================= */
import type { StepPropsS2 } from "@/validation/schemaform";

/* ================= VALIDATION ================= */
import { s2ParentSchema } from "@/validation/schemaform";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

/* ================= FORM TYPE ================= */
type FormType = z.infer<typeof s2ParentSchema>;

export default function StepParentS2({
  data,
  onResult,
  goToStep,
  currentStep,
  flow,
}: StepPropsS2) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormType>({
    resolver: zodResolver(s2ParentSchema),
    defaultValues: data,
  });

  const maxDate = useMaxBirthDate();

  const onSubmit = (values: FormType) => {
    onResult({ action: "next", data: values });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className={styles.container}>
        <div className={styles.formWrapper}>

          {/* HEADER */}
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

          {/* ================= PARENT LOOP ================= */}
          {PARENT_SECTIONS.map((section) => (
            <div key={section.type}>
              <h2 className={styles.sectionTitle}>{section.title}</h2>

              {/* NIK — kept inline: digit sanitize */}
              <div className={form.formGroup}>
                <label className={form.label}>
                  {section.labels.nik}
                </label>

                <input
                  {...register(section.fields.nik)}
                  className={`${form.input} ${errors[section.fields.nik] ? form.inputError : ""}`}
                  inputMode="numeric"
                  maxLength={16}
                  placeholder="Contoh: 1234567890123456"
                  onChange={(e) => {
                    const value = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 16);

                    setValue(section.fields.nik, value, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  }}
                />

                {errors[section.fields.nik] && (
                  <p className={form.errorText}>
                    {errors[section.fields.nik]?.message}
                  </p>
                )}
              </div>

              {/* NAMA — kept inline: whitespace sanitize */}
              <div className={form.formGroup}>
                <label className={form.label}>
                  {section.labels.nama}
                </label>

                <input
                  {...register(section.fields.nama)}
                  className={`${form.input} ${errors[section.fields.nama] ? form.inputError : ""}`}
                  placeholder={`Masukkan nama lengkap ${section.type}`}
                  autoComplete="name"
                  onChange={(e) => {
                    const value = e.target.value
                      .replace(/\s+/g, " ")
                      .trimStart();

                    setValue(section.fields.nama, value, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  }}
                />

                {errors[section.fields.nama] && (
                  <p className={form.errorText}>
                    {errors[section.fields.nama]?.message}
                  </p>
                )}
              </div>

              {/* TGL — kept inline: type="date" with max */}
              <div className={form.formGroup}>
                <label className={form.label}>
                  {section.labels.tgl}
                </label>

                <input
                  type="date"
                  max={maxDate}
                  {...register(section.fields.tgl)}
                  className={`${form.input} ${errors[section.fields.tgl] ? form.inputError : ""}`}
                />

                <small className={form.helperText}>
                  Format: YYYY-MM-DD (contoh: 1980-12-31)
                </small>

                {errors[section.fields.tgl] && (
                  <p className={form.errorText}>
                    {errors[section.fields.tgl]?.message}
                  </p>
                )}
              </div>

              {/* TELP — kept inline: digit sanitize */}
              <div className={form.formGroup}>
                <label className={form.label}>
                  {section.labels.telp}
                </label>

                <input
                  {...register(section.fields.telp)}
                  className={`${form.input} ${errors[section.fields.telp] ? form.inputError : ""}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={15}
                  placeholder="Contoh: 08123456789"
                  autoComplete="tel"
                  onChange={(e) => {
                    const value = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 15);

                    setValue(section.fields.telp, value, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  }}
                />

                <small className={form.helperText}>
                  Gunakan nomor aktif (maks. 15 digit, tanpa spasi atau simbol)
                </small>

                {errors[section.fields.telp] && (
                  <p className={form.errorText}>
                    {errors[section.fields.telp]?.message}
                  </p>
                )}
              </div>

              {/* ================= SELECTS ================= */}
              {PARENT_SELECT_FIELDS.map((item) => {
                const name =
                  section.fields[item.fieldKey as keyof typeof section.fields];

                const label =
                  section.labels[item.fieldKey as keyof typeof section.labels];

                const who = section.type;

                return (
                  <SelectField<FormType>
                    key={item.fieldKey}
                    label={label}
                    name={name as keyof FormType}
                    register={register}
                    errors={errors}
                    options={item.options}
                    placeholder={`${item.placeholder} ${who}`}
                  />
                );
              })}

              {/* ================= STATUS ================= */}
              <SelectField<FormType>
                label={`${section.labels.stat}`}
                name={section.fields.stat as keyof FormType}
                register={register}
                errors={errors}
                options={STATUS_ORANG_TUA_OPTIONS}
                placeholder={`Pilih status ${section.type}`}
              />
            </div>
          ))}

          {/* ================= EXTRA ================= */}
          <h3 className={styles.sectionTitle}>
            Alamat Orang Tua (Parents' Home Address)
          </h3>

          {EXTRA_FIELDS.map((f) => (
            <div key={f.name} className={form.formGroup}>
              <label className={form.label}>{f.label}</label>

              <input
                {...register(f.name)}
                className={`${form.input} ${errors[f.name] ? form.inputError : ""}`}
                placeholder={f.placeholder}
                onChange={(e) => {
                  const value = e.target.value.trimStart();

                  setValue(f.name, value, {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                }}
              />

              <small className={form.helperText}>
                Masukkan alamat lengkap sesuai domisili orang tua
              </small>

              {errors[f.name] && (
                <p className={form.errorText}>
                  {errors[f.name]?.message}
                </p>
              )}
            </div>
          ))}

          {/* ================= BUTTON ================= */}
          <div className={form.buttonGroup}>
            <button
              type="button"
              className={`${form.btn} ${form.btnDanger}`}
              onClick={() => onResult({ action: "prev" })}
            >
              Kembali (Back)
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
  );
}
