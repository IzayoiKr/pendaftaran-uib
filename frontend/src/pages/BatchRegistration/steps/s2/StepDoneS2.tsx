"use client";

import styles from "@/pages/BatchRegistration/styles/StepDone.module.scss";
import ProgressBar from "@/pages/BatchRegistration/components/ProgressBar";

import {
  S2_STEP2_DOCS,
  getProdiName,
} from "@/constants/registerOptions";

import type { FormDataS2, StepItem } from "@/validation/schemaform";

type DocKey = keyof FormDataS2;

type Props = {
  data: Partial<FormDataS2>;
  currentStep: number;
  flow: StepItem[];
  goToStep: (n: number) => void;
};

export default function StepDoneS2({
  data,
  currentStep,
  flow,
  goToStep,
}: Props) {
  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>

        {/* ================= HEADER ================= */}
        <div className={styles.header}>
          <h1 className={styles.title}>
            KONFIRMASI PENDAFTARAN
          </h1>

          <ProgressBar
            currentStep={currentStep}
            goToStep={goToStep}
            steps={flow}
          />
        </div>

        {/* ================= SUCCESS MESSAGE ================= */}
        <div className={styles.section}>
          <p className={styles.subtitle}>
            🎉 Pendaftaran Anda telah berhasil dikirim!
          </p>
        </div>

        {/* ================= SUMMARY ================= */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Ringkasan Data</h3>

          <div className={styles.table}>
            <div className={styles.rowHeader}>
              <span>Field</span>
              <span>Data</span>
            </div>

            <div className={styles.row}>
              <span>Nama</span>
              <strong>{data.nama || "-"}</strong>
            </div>
            <div className={styles.row}>
              <span>Email</span>
              <strong>{data.email || "-"}</strong>
            </div>
            <div className={styles.row}>
              <span>No HP</span>
              <strong>{data.nohp || "-"}</strong>
            </div>
            <div className={styles.row}>
              <span>Program</span>
              <strong>
                {data.prodipil ? getProdiName(data.prodipil) : "-"}
              </strong>
            </div>
            <div className={styles.row}>
              <span>Nama Ayah</span>
              <strong>{data.nama_ayah || "-"}</strong>
            </div>
            <div className={styles.row}>
              <span>Nama Ibu</span>
              <strong>{data.nama_ibu || "-"}</strong>
            </div>
          </div>
        </div>

        {/* ================= DOCUMENT ================= */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Dokumen</h3>

          <div className={styles.table}>
            <div className={styles.rowHeader}>
              <span>Dokumen</span>
              <span>Status</span>
            </div>

            {S2_STEP2_DOCS.map((doc) => (
              <div key={doc.name} className={styles.row}>
                <span>{doc.label}</span>
                <strong>
                  {Boolean(data[doc.name as DocKey])
                    ? "✔ Sudah Upload"
                    : "❌ Belum"}
                </strong>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}