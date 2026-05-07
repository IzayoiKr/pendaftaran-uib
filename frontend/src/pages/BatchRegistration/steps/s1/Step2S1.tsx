"use client";

import { useRef, useMemo, useEffect } from "react";

import ProgressBar from "@/pages/BatchRegistration/components/ProgressBar";
import FileInputField from "@/pages/BatchRegistration/components/FileInputField";
import InputField from "@/pages/BatchRegistration/components/InputField";
import { useFormErrorHandler } from "@/pages/BatchRegistration/hooks/useFormErrorHandler";

import type { StepPropsS1 } from "@/validation/schemaform";

import { s1Step2Schema } from "@/validation/schemaform";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  S1_STEP2_PERSONAL_DOCS,
  S1_STEP2_TRANSFER_DOCS,
  S1_STEP2_DOCS,
  S1_STEP2_PAYMENT_DOC,
  S1_STEP2_PAYMENT_INFO,
} from "@/constants/registerOptions";

type FormType = z.infer<typeof s1Step2Schema>;

const MAX_FILE_SIZE_MB = 2;

export default function Step2S1({
  data,
  onResult,
  goToStep,
  currentStep,
  flow,
  isSubmitting,
  filesWereLost,
}: StepPropsS1 & {
  filesWereLost?: boolean;
}) {
  /* ================= RHF ================= */
  const methods = useForm<FormType>({
    resolver: zodResolver(s1Step2Schema),
    defaultValues: {
      ...data,
      jenisdaftar: data.jenisdaftar ?? "baru",
    },
  });
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = methods;

  const jenisdaftar = watch("jenisdaftar");

  const { onError } = useFormErrorHandler({ setFocus: methods.setFocus });

  const [
    pp,
    ktp,
    kk,
    buktibayar,
    transkrip_nilai,
    ijazah_dok,
  ] = watch([
    "pp",
    "ktp",
    "kk",
    "buktibayar",
    "transkrip_nilai",
    "ijazah_dok",
  ]);

  const values = {
    pp,
    ktp,
    kk,
    buktibayar,
    transkrip_nilai,
    ijazah_dok,
    jenisdaftar,
  };

  const fileValues = Object.fromEntries(
    Object.entries(values).filter(([, val]) => val instanceof File)
  ) as Partial<Record<keyof FormType, File>>;

  const isTransfer =
    jenisdaftar === "alihjenjang" ||
    jenisdaftar === "transfer";

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
              FORM PENDAFTARAN CALON MAHASISWA PROGRAM STRATA SATU
            </h1>

            <p className="titleSub">
              (Undergraduate Student Registration Form)
            </p>

            <ProgressBar
              currentStep={currentStep}
              goToStep={goToStep}
              steps={flow}
              isSubmitting={isSubmitting}
            />
          </div>

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

            {S1_STEP2_PERSONAL_DOCS.map((item) => (
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

          {/* DOKUMEN TRANSFER */}
          {isTransfer && (
            <div className="transferSection">
              <h3 className="sectionHeading">
                Dokumen Transfer (Transfer Documents)
              </h3>

              {S1_STEP2_TRANSFER_DOCS.map((item) => (
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
          )}

          {/* PEMBAYARAN */}
          <div className="paymentSection">
            <h3 className="sectionHeading">
              Pembayaran (Payment Details)
            </h3>

            <div className="infoBox">
              <div className="paymentInfo">
                <p><strong>Nama Bank :</strong> {S1_STEP2_PAYMENT_INFO.bank}</p>
                <p><strong>No Rekening :</strong> {S1_STEP2_PAYMENT_INFO.rekening}</p>
                <p><strong>Nama Pemilik :</strong> {S1_STEP2_PAYMENT_INFO.nama}</p>

                <p>
                  <strong>Panduan :</strong>{" "}
                  <a
                    href={S1_STEP2_PAYMENT_INFO.panduanUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                  >
                    Klik untuk Download
                  </a>
                </p>

                <p><strong>Biaya :</strong> {S1_STEP2_PAYMENT_INFO.biaya}</p>
              </div>
            </div>
          </div>

          {/* PEMILIK REKENING */}
          <InputField<FormType>
            label="Pemilik Rekening (Account Owner) *"
            name="pemilikrek"
            register={register}
            errors={errors}
            placeholder="Masukkan nama pemilik rekening"
            required
          />

          {/* BANK */}
          <InputField<FormType>
            label="Bank (Bank Name) *"
            name="bank"
            register={register}
            errors={errors}
            placeholder="Masukkan nama bank"
            required
          />

          {/* FILE BUKTI BAYAR */}
          <FileInputField
            label={S1_STEP2_PAYMENT_DOC.label}
            name={S1_STEP2_PAYMENT_DOC.name}
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

              {S1_STEP2_DOCS.map((doc) => {
                // Hide study docs if not transfer/alihjenjang
                if (doc.section === "study" && !isTransfer) return null;

                return (
                  <div key={doc.name} className="tableRow">
                    <span>{doc.label}</span>
                    <strong
                      className={`status ${fileValues[doc.name as keyof FormType] ? "statusSuccess" : "statusError"}`}
                    >
                      {fileValues[doc.name as keyof FormType] ? "✔ Sudah Upload" : "❌ Belum"}
                    </strong>
                  </div>
                );
              })}
            </div>
          </div>

          {/* BUTTON */}
          <div className="buttonGroup">
            <button
              type="button"
              onClick={() =>
                onResult({ action: "prev" })
              }
              disabled={isSubmitting}
              className="btn btnDanger"
            >
              Batal
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