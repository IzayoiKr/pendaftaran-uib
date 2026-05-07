"use client";

/* ================= COMPONENTS ================= */
import ProgressBar from "@/pages/BatchRegistration/components/ProgressBar";
import SelectField from "@/pages/BatchRegistration/components/SelectField";

/* ================= HOOKS ================= */
import { useMaxBirthDate } from "@/pages/BatchRegistration/hooks/useMaxBirthDate";
import { useFormErrorHandler } from "@/pages/BatchRegistration/hooks/useFormErrorHandler";

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
  isSubmitting,
}: StepPropsS2) {
  const methods = useForm<FormType>({
    resolver: zodResolver(s2ParentSchema),
    defaultValues: data,
  });
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = methods;

  const { onError } = useFormErrorHandler({ setFocus: methods.setFocus });

  const maxDate = useMaxBirthDate();

  const onSubmit = (values: FormType) => {
    onResult({ action: "next", data: values });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)}>
      <div className="formContainer">
        <div className="formWrapper">

          {/* HEADER */}
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

          {/* ================= PARENT LOOP ================= */}
          {PARENT_SECTIONS.map((section) => (
            <div key={section.type}>
              <h2 className="titleSection">{section.title}</h2>

              {/* NIK — kept inline: digit sanitize */}
              <div className="formGroup">
                <label className="label">
                  {section.labels.nik}
                </label>

                <input
                  {...register(section.fields.nik)}
                  className={`input ${errors[section.fields.nik] ? "inputError" : ""}`}
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
                  <p className="errorText">
                    {errors[section.fields.nik]?.message}
                  </p>
                )}
              </div>

              {/* NAMA — kept inline: whitespace sanitize */}
              <div className="formGroup">
                <label className="label">
                  {section.labels.nama}
                </label>

                <input
                  {...register(section.fields.nama)}
                  className={`input ${errors[section.fields.nama] ? "inputError" : ""}`}
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
                  <p className="errorText">
                    {errors[section.fields.nama]?.message}
                  </p>
                )}
              </div>

              {/* TGL — kept inline: type="date" with max */}
              <div className="formGroup">
                <label className="label">
                  {section.labels.tgl}
                </label>

                <input
                  type="date"
                  max={maxDate}
                  {...register(section.fields.tgl)}
                  className={`input ${errors[section.fields.tgl] ? "inputError" : ""}`}
                />

                <small className="helperText">
                  Format: YYYY-MM-DD (contoh: 1980-12-31)
                </small>

                {errors[section.fields.tgl] && (
                  <p className="errorText">
                    {errors[section.fields.tgl]?.message}
                  </p>
                )}
              </div>

              {/* TELP — kept inline: digit sanitize */}
              <div className="formGroup">
                <label className="label">
                  {section.labels.telp}
                </label>

                <input
                  {...register(section.fields.telp)}
                  className={`input ${errors[section.fields.telp] ? "inputError" : ""}`}
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

                <small className="helperText">
                  Gunakan nomor aktif (maks. 15 digit, tanpa spasi atau simbol)
                </small>

                {errors[section.fields.telp] && (
                  <p className="errorText">
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
          <h3 className="titleSection">
            Alamat Orang Tua (Parents' Home Address)
          </h3>

          {EXTRA_FIELDS.map((f) => (
            <div key={f.name} className="formGroup">
              <label className="label">{f.label}</label>

              <input
                {...register(f.name)}
                className={`input ${errors[f.name] ? "inputError" : ""}`}
                placeholder={f.placeholder}
                onChange={(e) => {
                  const value = e.target.value.trimStart();

                  setValue(f.name, value, {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                }}
              />

              <small className="helperText">
                Masukkan alamat lengkap sesuai domisili orang tua
              </small>

              {errors[f.name] && (
                <p className="errorText">
                  {errors[f.name]?.message}
                </p>
              )}
            </div>
          ))}

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
              Kembali (Back)
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
  );
}