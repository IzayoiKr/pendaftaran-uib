"use client";

import styles from "@/pages/BatchRegistration/styles/StepDone.module.scss";
import ProgressBar from "@/pages/BatchRegistration/components/ProgressBar";

import {
  S1_STEP2_DOCS,
  getProdiName,
} from "@/constants/registerOptions";

import type { FormDataS1, StepItem } from "@/validation/schemaform";

type DocKey = keyof FormDataS1;

type Props = {
  data: Partial<FormDataS1>;
  currentStep: number;
  flow: StepItem[];
  goToStep: (n: number) => void;
};

const isTransfer = (jenis?: string) =>
  jenis === "alihjenjang" || jenis === "transfer";

export default function StepDoneS1({
  data,
  currentStep,
  flow,
  goToStep,
}: Props) {
  const docs = S1_STEP2_DOCS.filter((doc) =>
    doc.section === "study" ? isTransfer(data.jenisdaftar) : true
  );

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>

        {/* ================= HEADER ================= */}
        <div className={styles.header}>
          <h1 className={styles.title}>
            KONFIRMASI DATA PENDAFTARAN
          </h1>

          <p className={styles.subtitle}>
            (Registration Data Confirmation)
          </p>

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
          <h3 className={styles.sectionTitle}>Program Studi</h3>

          <div className={styles.prodiCard}>
            <div className={styles.prodiLabel}>Pilihan Anda</div>
            <div className={styles.prodiName}>
              {getProdiName(data.prodipil) || "-"}
            </div>
          </div>
        </div>

        {/* ================= DOCUMENT ================= */}
        <div className={styles.table}>
          {/* HEADER */}
          <div className={styles.rowHeader}>
            <span>Dokumen</span>
            <span>Status</span>
          </div>

          {/* ROWS */}
          {docs.map((doc) => (
            <div key={doc.name} className={styles.row}>
              <span>{doc.label}</span>
              <strong>
                {data[doc.name as DocKey]
                  ? "✔ Sudah Upload"
                  : "❌ Belum"}
              </strong>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}