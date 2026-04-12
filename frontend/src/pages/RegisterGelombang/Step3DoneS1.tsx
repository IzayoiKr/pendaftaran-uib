import styles from "./Step3Done.module.scss";
import form from "../../styles/form.module.scss";
import ProgressBar from "../../hooks/ProgressBar";

type Props = {
  formData: any;
  prev: () => void;
  submitFinal: () => void;
  goToStep: (n: number) => void;
  currentStep: number;
};

export default function Step3DoneS1({
  formData,
  prev,
  submitFinal,
  goToStep,
  currentStep,
}: Props) {
  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>

        {/* HEADER */}
        <div className={styles.header}>
          <h1 className={styles.mainTitle}>
            KONFIRMASI PENDAFTARAN
          </h1>

          <ProgressBar
            currentStep={currentStep}
            goToStep={goToStep}
            steps={[
              { label: "BIODATA DIRI", sub: "PERSONAL DATA" },
              { label: "DOKUMEN", sub: "DOCUMENT" },
              { label: "SELESAI", sub: "DONE" },
            ]}
          />
        </div>

        {/* INFO */}
        <div className={styles.infoBox}>
          <p>Silakan periksa kembali data Anda sebelum submit.</p>
        </div>

        {/* ================= RINGKASAN ================= */}
        <h3 className={styles.sectionTitle}>Ringkasan Data</h3>

        <div className={styles.summaryBox}>
          <div className={styles.summaryItem}>
            <span>Nama</span>
            <strong>{formData.nama || "-"}</strong>
          </div>
          <div className={styles.summaryItem}>
            <span>Email</span>
            <strong>{formData.email || "-"}</strong>
          </div>
          <div className={styles.summaryItem}>
            <span>No HP</span>
            <strong>{formData.nohp || "-"}</strong>
          </div>
          <div className={styles.summaryItem}>
            <span>Program</span>
            <strong>{formData.prodipil || "-"}</strong>
          </div>
        </div>

        {/* ================= STATUS DOKUMEN ================= */}
        <h3 className={styles.sectionTitle}>Dokumen</h3>

        <div className={styles.summaryBox}>
          {[
            { key: "pp", label: "Pas Photo (PP)" },
            { key: "ktp", label: "Kartu Tanda Penduduk / SIM / Passport (KTP)" },
            { key: "kk", label: "Kartu Keluarga (KK)" },
            { key: "buktibayar", label: "Bukti Pembayaran (Bukti Bayar)" },
            ...(formData.jenisdaftar === "alihjenjang" || formData.jenisdaftar === "transfer"
              ? [
                  { key: "transkrip_nilai", label: "Transkrip Nilai (Transcript)" },
                  { key: "ijazah_dok", label: "Ijazah (Diploma)" },
                ]
              : []),
          ].map(({ key, label }) => (
            <div key={key} className={styles.summaryItem}>
              <span>{label}</span>
              <strong>
                {formData[key] ? "✔ Sudah Upload" : "❌ Belum"}
              </strong>
            </div>
          ))}
        </div>

        {/* ================= WARNING ================= */}
        <div className={styles.warningBox}>
          <p>
            Setelah submit, data tidak dapat diubah. Pastikan semua data sudah benar.
          </p>
        </div>

        {/* ================= BUTTON ================= */}
        <div className={form.buttonGroup}>
          <button
            className={`${form.btn} ${form.btnDanger}`}
            onClick={prev}
          >
            Kembali
          </button>
          <button
            className={`${form.btn} ${form.btnPrimary}`}
            onClick={submitFinal}
          >
            Submit Final
          </button>
        </div>

      </div>
    </div>
  );
}