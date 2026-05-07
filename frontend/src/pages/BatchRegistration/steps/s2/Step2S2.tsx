"use client";

import { useRef, useMemo, useEffect } from "react";

import ProgressBar from "@/pages/BatchRegistration/components/ProgressBar";
import FileInputField from "@/pages/BatchRegistration/components/FileInputField";
import InputField from "@/pages/BatchRegistration/components/InputField";
import { useFormErrorHandler } from "@/pages/BatchRegistration/hooks/useFormErrorHandler";

import type { StepPropsS2 } from "@/validation/schemaform";

import { s2Step2Schema } from "@/validation/schemaform";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  S2_STEP2_PERSONAL_DOCS,
  S2_STEP2_STUDY_DOCS,
  S2_STEP2_DOCS,
  S2_STEP2_PAYMENT_DOC,
  S2_STEP2_PAYMENT_INFO,
} from "@/constants/registerOptions";

type FormType = z.infer<typeof s2Step2Schema>;

const MAX_FILE_SIZE_MB = 2;

export default function Step2S2({
  data,
  onResult,
  goToStep,
  currentStep,
  flow,
  isSubmitting,
  filesWereLost,
}: StepPropsS2 & {
  filesWereLost?: boolean;
}) {
  /* ================= RHF ================= */
  const methods = useForm<FormType>({
    resolver: zodResolver(s2Step2Schema),
    defaultValues: { ...data },
  });
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = methods;

  const { onError } = useFormErrorHandler({ setFocus: methods.setFocus });

  const [pp, ktp, kk, al, r1, r4, buktibayar] = watch([
    "pp",
    "ktp",
    "kk",
    "al",
    "r1",
    "r4",
    "buktibayar",
  ]);

  const values = { pp, ktp, kk, al, r1, r4, buktibayar };

  const fileValues = Object.fromEntries(
    Object.entries(values).filter(([, val]) => val instanceof File)
  ) as Partial<Record<keyof FormType, File>>;

  /* ================= PREVIEW ================= */
  const previewCache = useRef<Partial<Record<keyof FormType, string>>>({});
  const fileCache = useRef<Partial<Record<keyof FormType, File>>>({});

  const filesPreview = useMemo(() => {
    const map: Partial<Record<keyof FormType, string>> = {};

    Object.entries(values).forEach(([key, val]) => {
      const typedKey = key as keyof FormType;

      if (val instanceof File) {
        const existingUrl = previewCache.current[typedKey];
        const prevFile = fileCache.current[typedKey];

        const isSameFile =
          prevFile &&
          prevFile.name === val.name &&
          prevFile.size === val.size;

        if (!existingUrl || !isSameFile) {
          if (existingUrl) {
            URL.revokeObjectURL(existingUrl);
          }

          previewCache.current[typedKey] = URL.createObjectURL(val);
          fileCache.current[typedKey] = val;
        }

        map[typedKey] = previewCache.current[typedKey];
      } else {
        const existingUrl = previewCache.current[typedKey];

        if (existingUrl) {
          URL.revokeObjectURL(existingUrl);
          delete previewCache.current[typedKey];
          delete fileCache.current[typedKey];
        }
      }
    });

    return map;
  }, [values]);

  /* ================= CLEANUP ================= */
  useEffect(() => {
    return () => {
      Object.values(previewCache.current).forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, []);

  /* ================= SUBMIT ================= */
  const onSubmit = (values: FormType) => {
    onResult({ action: "submit", data: values });
  };

  return (
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

          <p className="requiredNote">
            * Wajib di Isi (Required)
          </p>

          {filesWereLost && (
            <div className="warningBanner">
              ⚠️ Dokumen yang sebelumnya dipilih
              tidak tersimpan setelah refresh
              halaman. Harap upload ulang file
              sebelum submit.
            </div>
          )}

          {/* ================= DOKUMEN PRIBADI ================= */}
          <div className="documentsSection">
            <h3 className="sectionHeading">
              Dokumen Pribadi (Personal Documents)
            </h3>

            {S2_STEP2_PERSONAL_DOCS.map((item) => (
              <FileInputField
                key={item.name}
                label={item.label}
                name={item.name}
                files={fileValues}
                filesPreview={filesPreview}
                errors={errors}
                maxSizeMB={MAX_FILE_SIZE_MB}
                control={control}
              />
            ))}
          </div>

          {/* ================= DOKUMEN STUDI ================= */}
          <div className="documentsSection">
            <h3 className="sectionHeading">
              Dokumen Studi (Study Documents)
            </h3>

            {S2_STEP2_STUDY_DOCS.map((item) => (
              <FileInputField
                key={item.name}
                label={item.label}
                name={item.name}
                files={fileValues}
                filesPreview={filesPreview}
                errors={errors}
                maxSizeMB={MAX_FILE_SIZE_MB}
                control={control}
              />
            ))}
          </div>

          {/* ================= PEMBAYARAN ================= */}
          <div className="paymentSection">
            <h3 className="sectionHeading">
              Biaya Formulir Pendaftaran (Registration Form Fee)
            </h3>

            <div className="infoBox">
              <div className="paymentInfo">
                <p><strong>Nama Bank :</strong> {S2_STEP2_PAYMENT_INFO.bank}</p>
                <p><strong>No Rekening :</strong> {S2_STEP2_PAYMENT_INFO.rekening}</p>
                <p><strong>Nama Pemilik :</strong> {S2_STEP2_PAYMENT_INFO.nama}</p>

                <p>
                  <strong>Panduan :</strong>{" "}
                  <a
                    href={S2_STEP2_PAYMENT_INFO.panduanUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                  >
                    Klik untuk Download
                  </a>
                </p>

                <p><strong>Biaya :</strong> {S2_STEP2_PAYMENT_INFO.biaya}</p>
              </div>
            </div>
          </div>

          {/* ================= PEMILIK REKENING ================= */}
          <InputField<FormType>
            label="Pemilik Rekening (Account Owner) *"
            name="pemilikrek"
            register={register}
            errors={errors}
            placeholder="Masukkan nama pemilik rekening"
            required
          />

          {/* ================= BANK ================= */}
          <InputField<FormType>
            label="Bank (Bank Name)"
            name="bank"
            register={register}
            errors={errors}
            placeholder="Masukkan nama bank"
          />

          {/* ================= BUKTI PEMBAYARAN ================= */}
          <FileInputField
            label={S2_STEP2_PAYMENT_DOC.label}
            name={S2_STEP2_PAYMENT_DOC.name}
            files={fileValues}
            filesPreview={filesPreview}
            errors={errors}
            maxSizeMB={MAX_FILE_SIZE_MB}
            control={control}
          />

          {/* ================= DOCUMENT STATUS (REAL-TIME) ================= */}
          <div className="section">
            <h3 className="titleSection">Status Dokumen</h3>

            <div className="table">
              <div className="tableRowHeader">
                <span>Dokumen</span>
                <span>Status</span>
              </div>

              {S2_STEP2_DOCS.map((doc) => (
                <div key={doc.name} className="tableRow">
                  <span>{doc.label}</span>
                <strong
                  className={`status ${fileValues[doc.name as keyof FormType] ? "statusSuccess" : "statusError"}`}
                >
                  {fileValues[doc.name as keyof FormType] ? "✔ Sudah Upload" : "❌ Belum"}
                </strong>
                </div>
              ))}
            </div>
          </div>

          {/* ================= BUTTON ================= */}
          <div className="buttonGroup">
            <button
              type="button"
              onClick={() =>
                onResult({ action: "prev" })
              }
              disabled={isSubmitting}
              className="btn btnDanger"
            >
              Kembali (Back)
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              className="btn btnPrimary"
            >
              {isSubmitting
                ? "Uploading..."
                : "Upload (Submit)"}
            </button>
          </div>

        </div>
      </div>
    </form>
  );
}