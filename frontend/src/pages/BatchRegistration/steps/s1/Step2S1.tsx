"use client";

import { useRef, useMemo, useEffect } from "react";

import styles from "@/pages/BatchRegistration/styles/Step2.module.scss";
import form from "@/pages/BatchRegistration/styles/Form.module.scss";

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
  S1_STEP2_PAYMENT_DOC,
  S1_STEP2_PAYMENT_INFO,
} from "@/constants/registerOptions";

// ─── STATUS DISPLAY ───────────────────────────────────────
// DISPLAY ONLY — tidak ada kaitan dengan form validation / RHF
import RegistrationStatusSection, {
  buildS1StatusItems,
  DEFAULT_S1_STATUS,
  type S1StatusData,
} from "../../components/RegistrationStatusSection";
// ─────────────────────────────────────────────────────────

type FormType = z.infer<typeof s1Step2Schema>;

const MAX_FILE_SIZE_MB = 2;

export default function Step2S1({
  data,
  onResult,
  goToStep,
  currentStep,
  flow,
  isSubmitting,
}: StepPropsS1) {
  /* ================= RHF ================= */
  const methods = useForm<FormType>({
    resolver: zodResolver(s1Step2Schema),   // ← tetap di sini
    defaultValues: {
      ...data,
      jenisdaftar: data.jenisdaftar ?? "baru",  // ← tetap di sini
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

  /* ================= STATUS DATA ================= */
  // TODO: Ganti DEFAULT_S1_STATUS dengan data dari API:
  //   const [statusData, setStatusData] = useState<S1StatusData>(DEFAULT_S1_STATUS);
  //   useEffect(() => {
  //     fetch(`/api/registration-status?key=${data.registrationKey}`)
  //       .then(r => r.json())
  //       .then(setStatusData);
  //   }, [data.registrationKey]);
  //
  // Sementara ini gunakan default (semua "Masih dalam pemeriksaan").
  const statusData: S1StatusData = DEFAULT_S1_STATUS;
  const statusItems = buildS1StatusItems(statusData);

  /* ================= SUBMIT ================= */
  const onSubmit = (values: FormType) => {
    onResult({ action: "submit", data: values });
  };

  return (
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

          {/* ================= DOKUMEN PRIBADI ================= */}
          <div className={styles.documentsSection}>
            <h3 className={styles.sectionHeading}>
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
            <div className={styles.transferSection}>
              <h3 className={styles.sectionHeading}>
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
          <div className={styles.paymentSection}>
            <h3 className={styles.sectionHeading}>
              Pembayaran (Payment Details)
            </h3>

            <div className={styles.infoBox}>
              <div className={styles.paymentInfo}>
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

          {/* ================= STATUS DOKUMEN & PEMBAYARAN ================= */}
          {/*
            DISPLAY ONLY — informasi dari sistem/admin.
            Tidak ada register(), tidak ada Zod, tidak ikut submit.
            Wire ke API: ganti statusData di atas dengan hasil fetch.
          */}
          <RegistrationStatusSection
            title="Status Dokumen (Document Status)"
            items={statusItems}
          />

          {/* BUTTON */}
          <div className={form.buttonGroup}>
            <button
              type="button"
              onClick={() => onResult({ action: "prev" })}
              className={`${form.btn} ${form.btnDanger}`}
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`${form.btn} ${form.btnPrimary}`}
            >
              {isSubmitting ? "Uploading..." : "Upload (Submit)"}
            </button>
          </div>

        </div>
      </div>
    </form>
  );
}