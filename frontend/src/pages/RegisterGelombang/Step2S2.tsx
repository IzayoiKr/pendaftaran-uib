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

export default function Step2S2({
  formData,
  setFormData,
  prev,
  submit,
  goToStep,
  currentStep,
}: Props) {
  const [files, setFiles] = useState<any>({});
  const [completeness, setCompleteness] = useState("Masih ada dokumen yang tidak lengkap");
  const [checkStatus, setCheckStatus] = useState("Masih dalam pemeriksaan (Under Assessment)");
  const [checkNotes, setCheckNotes] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("Masih dalam pemeriksaan (Under Assessment)");
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

  const handleSubmit = () => {
    const required = ["al", "kk", "pp", "ktp", "r1", "r4", "buktibayar"];
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

  // Helper function untuk render file input — matches Step2S1 pattern
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
            accept="application/pdf"
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
            FORM PENDAFTARAN PROGRAM STRATA DUA
          </h1>
          <p className={styles.subTitle}>
            (Postgraduate Student Registration Form)
          </p>

          <ProgressBar
            currentStep={currentStep}
            goToStep={goToStep}
            steps={[
              { label: "BIODATA DIRI", sub: "PERSONAL DATA" },
              { label: "DOKUMEN", sub: "DOCUMENT" },
              { label: "BIODATA ORANGTUA", sub: "(PARENTAL DATA)" },
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
              <strong>Catatan Pemeriksaan Dokumen (Document Assessment Notes):</strong>
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

          {renderFileInput("Dokumen Akta Lahir (Birth Certificate)", "al")}
          {renderFileInput("Dokumen Kartu Keluarga (Family Card)", "kk")}
          {renderFileInput("Dokumen Pas Photo (Passport Photo)", "pp")}
          {renderFileInput("Dokumen KTP (National Identity Card)", "ktp")}
        </div>

        {/* ================= DOKUMEN SEKOLAH ================= */}
        <div className={styles.documentsSection}>
          <h3 className={styles.sectionHeading}>Dokumen Sekolah (School Documents)</h3>

          {renderFileInput("Ijazah (Bachelor Certificate)", "r1")}
          {renderFileInput("Transkrip Nilai Sarjana (Academic Transcript)", "r4")}
        </div>

        {/* ================= PEMBAYARAN ================= */}
        <div className={styles.paymentSection}>
          <h3 className={styles.sectionHeading}>Biaya Formulir Pendaftaran (Registration Form Fee)</h3>

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
                <strong>Panduan (Guide) :</strong>{" "}
                <a
                  href="https://pendaftaran.uib.ac.id/dokumen/panduanpenggunaanqris.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                >
                  Klik untuk Download (Click Here to Download)
                </a>
              </p>
              <p>
                <strong>Biaya Formulir Pendaftaran (Form Fee) S2 :</strong> Rp. 1.500.000
              </p>
            </div>
          </div>

          <div className={form.formGroup}>
            <label className={form.label}>Pemilik Rekening (Account owner) *</label>
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
            <label className={form.label}>Bank (Bank Name)</label>
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
            Kembali (Back)
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