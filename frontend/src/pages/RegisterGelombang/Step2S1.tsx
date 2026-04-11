import { useState } from "react";
import styles from "./Step2.module.scss";
import form from "../../styles/form.module.scss";
import ProgressBar from "../../hooks/ProgressBar";

type Props = {
  formData: any;
  setFormData: (data: any) => void;
  prev: () => void;
  submit: () => void;
  goToStep: (n: number) => void;
  currentStep: number;
};

export default function Step2S1({
  formData,
  setFormData,
  prev,
  submit,
  goToStep,
  currentStep,
}: Props) {
  const [files, setFiles] = useState<any>({});
  const [completeness, setCompleteness] = useState("Masih ada dokumen yang tidak lengkap");
  const [checkStatus, setCheckStatus] = useState("Masih dalam pemeriksaan");
  const [checkNotes, setCheckNotes] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("Masih dalam pemeriksaan");
  const [paymentNotes, setPaymentNotes] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, files: fileList } = e.target;

    if (fileList?.[0]) {
      const file = fileList[0];

      setFiles((prev: any) => ({
        ...prev,
        [name]: file,
      }));

      setFormData({
        ...formData,

        [name]: file,

        [`${name}Url`]: URL.createObjectURL(file),
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const isTransfer =
    formData.jenisdaftar === "alihjenjang" ||
    formData.jenisdaftar === "transfer";

const handleSubmit = () => {
  const required = ["pp", "ktp", "kk", "buktibayar"];

  if (isTransfer) {
    required.push("transkrip_nilai", "ijazah_dok");
  }

  const missing = required.filter((f) => !formData[f]);

  if (missing.length > 0) {
    setCompleteness("Tidak Lengkap");
    setCheckStatus("Rejected");
    setCheckNotes(`Dokumen kurang: ${missing.join(", ")}`);

    alert(`Dokumen belum lengkap: ${missing.join(", ")}`);
    return;
  }

  setCompleteness("Lengkap");
  setCheckStatus("Pending");
  setCheckNotes("Menunggu verifikasi admin");

  if (!formData.pemilikrek || !formData.bank) {
    setPaymentStatus("Belum Dibayar");
    setPaymentNotes("Data pembayaran belum lengkap");

    alert("Data pembayaran belum lengkap");
    return;
  }

  setPaymentStatus("Sudah Dibayar");
  setPaymentNotes("Menunggu konfirmasi pembayaran");

  submit();
};

  const renderFileInput = (label: string, name: string) => (
    <div className={form.formGroup} key={name}>
      <label className={form.label}>{label} *</label>
      <div className={styles.fileBox}>
        <div className={styles.fileInputWrapper}>
          <input
            type="file"
            id={name}
            name={name}
            className={styles.customFileInput}
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png"
          />
          <label htmlFor={name} className={styles.customFileLabel}>
            {files[name]?.name || label}
          </label>
        </div>
        <p className={styles.uploadedDoc}>
          Dokumen Terupload (Uploaded Document):{" "}
          {files[name] ? (
            <>
              <span>{files[name].name}</span>
              {" - "}
              <a href={formData[`${name}Url`]} download>
                Download
              </a>
            </>
          ) : (
            "Belum ada file"
          )}
        </p>
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>

        {/* HEADER */}
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
            steps={[
              { label: "BIODATA DIRI", sub: "PERSONAL DATA" },
              { label: "DOKUMEN", sub: "DOCUMENT" },
              { label: "SELESAI", sub: "DONE" },
            ]}
          />
        </div>

        {/* ================= STATUS DOKUMEN ================= */}
        <div className={styles.statusSection}>
          <h5 className={styles.sectionHeading}>Status Dokumen (Document Status)</h5>

          <div className={styles.infoBox}>
            <div className={styles.statusItem}>
              <strong>Kelengkapan Dokumen (Completion of Requirement):</strong>
              <span className={styles.statusValue}>{completeness}</span>
            </div>
            <div className={styles.statusItem}>
              <strong>Status Pemeriksaan Dokumen (Document Check Status):</strong>
              <span className={styles.statusValue}>{checkStatus}</span>
            </div>
            <div className={styles.statusItem}>
              <strong>Catatan Pemeriksaan Dokumen (Document Inspection Notes):</strong>
              <span className={styles.statusValue}>{checkNotes || "-"}</span>
            </div>
            <div className={styles.statusItem}>
              <strong>Status Pemeriksaan Pembayaran (Payment Check Status):</strong>
              <span className={styles.statusValue}>{paymentStatus}</span>
            </div>
            <div className={styles.statusItem}>
              <strong>Catatan Pemeriksaan Keuangan (Payment Notes):</strong>
              <span className={styles.statusValue}>{paymentNotes || "-"}</span>
            </div>
          </div>

          <p className={styles.requiredNote}>* Wajib di Isi (Required)</p>
        </div>

        {/* ================= DOKUMEN PRIBADI ================= */}
        <div className={styles.documentsSection}>
          <h3 className={styles.sectionHeading}>Dokumen Pribadi (Personal Documents)</h3>

          {renderFileInput("Pas Photo (Photo Image)", "pp")}
          {renderFileInput("Dokumen KTP / SIM / Passport (National Identity Card)", "ktp")}
          {renderFileInput("Dokumen Kartu Keluarga (Family Card)", "kk")}
        </div>

        {/* ================= DOKUMEN TRANSFER ================= */}
        {isTransfer && (
          <div className={styles.transferSection}>
            <h3 className={styles.sectionTitle}>Dokumen Transfer (Transfer Documents)</h3>

            {renderFileInput("Transkrip Nilai (Transcript of Grades)", "transkrip_nilai")}
            {renderFileInput("Ijazah (Diploma)", "ijazah_dok")}
          </div>
        )}

        {/* ================= PEMBAYARAN ================= */}
        <div className={styles.paymentSection}>
          <h3 className={styles.sectionHeading}>Pembayaran (Payment Details)</h3>

          <div className={styles.infoBox}>
            <div className={styles.paymentInfo}>
              <p>
                <strong>Nama Bank (Bank Name) :</strong> OCBC NISP
              </p>
              <p>
                <strong>No Rekening (Account Number) :</strong> 094800007802
              </p>
              <p>
                <strong>Nama Pemilik Rekening (Account Owner) :</strong> Universitas Internasional Batam
              </p>
              <p>
                <strong>Panduan (Guidance of Payment) :</strong>{" "}
                <a
                  href="/panduanpenggunaanqris.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                >
                  Klik untuk Download
                </a>
              </p>
              <p>
                <strong>Biaya Formulir (Form Fee): </strong> Rp 250.000
              </p>
            </div>
          </div>

          <div className={form.formGroup}>
            <label className={form.label}>Pemilik Rekening (Account Owner) *</label>
            <input
              type="text"
              className={form.input}
              name="pemilikrek"
              value={formData.pemilikrek || ""}
              onChange={handleChange}
              placeholder="Masukkan nama pemilik rekening"
            />
          </div>

          <div className={form.formGroup}>
            <label className={form.label}>Bank (Bank Name) *</label>
            <input
              type="text"
              className={form.input}
              name="bank"
              value={formData.bank || ""}
              onChange={handleChange}
              placeholder="Masukkan nama bank"
            />
          </div>

          {renderFileInput("Bukti Pembayaran (Receipt of Payment)", "buktibayar")}
        </div>

        {/* ================= BUTTON ================= */}
        <div className={form.buttonGroup}>
          <button
            type="button"
            onClick={prev}
            className={`${form.btn} ${form.btnDanger}`}
          >
            Batal (Cancel)
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className={`${form.btn} ${form.btnPrimary}`}
          >
            Upload (Submit)
          </button>
        </div>

      </div>
    </div>
  );
}
