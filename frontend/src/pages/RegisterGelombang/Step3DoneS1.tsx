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
  
  // Cek apakah jenis pendaftaran butuh dokumen ekstra
  const isTransfer = formData.jenisdaftar === "alihjenjang" || formData.jenisdaftar === "transfer";

  // Gabungkan pilihan prodi menjadi satu baris teks
  const prodiChoices = [formData.prodipil, formData.prodipil2, formData.prodipil3]
    .filter(Boolean)
    .join(", ");

  // List dokumen yang wajib dicek
  const documents = [
    { key: "pp", label: "Pas Photo" },
    { key: "ktp", label: "KTP / Identitas" },
    { key: "kk", label: "Kartu Keluarga" },
    { key: "buktibayar", label: "Bukti Pembayaran" },
  ];

  if (isTransfer) {
    documents.push({ key: "transkrip_nilai", label: "Transkrip Nilai" });
    documents.push({ key: "ijazah_dok", label: "Ijazah Dokumen" });
  }

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>

        {/* HEADER */}
        <div className={styles.header}>
          <h1 className={styles.mainTitle}>KONFIRMASI PENDAFTARAN</h1>
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
          <p>Silakan periksa kembali data Anda. Pastikan semua informasi sudah benar sebelum melakukan Submit Final.</p>
        </div>

        {/* ================= RINGKASAN DATA ================= */}
        <h3 className={styles.sectionTitle}>Ringkasan Data (Data Summary)</h3>

        <div className={styles.summaryBox}>
          <div className={styles.summaryItem}>
            <span>Nama Lengkap</span>
            <strong>{formData.nama || "-"}</strong>
          </div>
          <div className={styles.summaryItem}>
            <span>Email</span>
            <strong>{formData.email || "-"}</strong>
          </div>
          <div className={styles.summaryItem}>
            <span>No HP / WA</span>
            <strong>{formData.nohp || "-"} / {formData.nohp2 || "-"}</strong>
          </div>
          <div className={styles.summaryItem}>
            <span>Jenis Pendaftaran</span>
            <strong style={{ textTransform: 'capitalize' }}>{formData.jenisdaftar || "-"}</strong>
          </div>
          <div className={styles.summaryItem}>
            <span>Asal Sekolah</span>
            <strong>{formData.asal_sekolah || "-"}</strong>
          </div>
          <div className={styles.summaryItem}>
            <span>Waktu Kuliah</span>
            <strong style={{ textTransform: 'capitalize' }}>{formData.waktukuliah || "-"}</strong>
          </div>
          <div className={styles.summaryItem}>
            <span>Program Studi Pilihan</span>
            <strong>{prodiChoices || "-"}</strong>
          </div>
        </div>

        {/* ================= STATUS DOKUMEN ================= */}
        <h3 className={styles.sectionTitle}>Status Dokumen (Document Status)</h3>

        <div className={styles.summaryBox}>
          {documents.map((doc) => (
            <div key={doc.key} className={styles.summaryItem}>
              <span>{doc.label}</span>
              <strong>
                {formData[doc.key] 
                  ? `✔ Terupload (${formData[`${doc.key}Name`]})` 
                  : "❌ Belum Terupload"}
              </strong>
            </div>
          ))}
        </div>

        {/* ================= WARNING ================= */}
        <div className={styles.warningBox}>
          <p>
            Setelah menekan tombol Submit Final, data tidak dapat diubah kembali.
          </p>
        </div>

        {/* ================= BUTTON ================= */}
        <div className={form.buttonGroup}>
          <button
            className={`${form.btn} ${form.btnDanger}`}
            onClick={prev}
          >
            Kembali (Edit Data)
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
