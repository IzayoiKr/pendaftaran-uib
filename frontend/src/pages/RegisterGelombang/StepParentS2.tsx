import styles from "./Step2.module.scss";
import form from "../../styles/form.module.scss";
import ProgressBar from "../../hooks/ProgressBar";
import {
  PENDIDIKAN_OPTIONS,
  PEKERJAAN_OPTIONS,
  PENGHASILAN_OPTIONS,
} from "../../constants/registerOptions";

type Props = {
  formData: any;
  setFormData: (data: any) => void;
  next: () => void;
  prev: () => void;
  goToStep: (n: number) => void;
  currentStep: number;
};

const S2_STEPS = [
  { label: "BIODATA DIRI",     sub: "PERSONAL DATA" },
  { label: "BIODATA ORANGTUA", sub: "PARENTAL DATA" },
  { label: "DOKUMEN",          sub: "DOCUMENT" },
  { label: "SELESAI",          sub: "DONE" },
];

export default function StepParentS2({
  formData,
  setFormData,
  next,
  prev,
  goToStep,
  currentStep,
}: Props) {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNext = () => {
    const required = ["nama_ayah", "notelp_ayah", "nama_ibu", "notelp_ibu"];
    const missing = required.filter((f) => !formData[f]);
    if (missing.length > 0) {
      alert(`Field wajib belum diisi: ${missing.join(", ")}`);
      return;
    }
    next();
  };

  /** Reusable select input */
  const renderSelect = (
    label: string,
    name: string,
    placeholder: string,
    options: { value: string; label: string }[]
  ) => (
    <div className={form.formGroup}>
      <label className={form.label}>{label}</label>
      <div className={form.selectWrapper}>
        <select className={form.select} name={name} value={formData[name] || ""} onChange={handleChange}>
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>

        {/* HEADER */}
        <div className={styles.header}>
          <h1 className={styles.mainTitle}>FORM PENDAFTARAN PROGRAM STRATA DUA</h1>
          <p className={styles.subTitle}>(Postgraduate Student Registration Form)</p>
          <ProgressBar currentStep={currentStep} goToStep={goToStep} steps={S2_STEPS} />
        </div>

        {/* ================= AYAH ================= */}
        <h2 className={styles.sectionHeading}>BIODATA AYAH (BIOLOGICAL FATHER)</h2>

        <div className={form.formGroup}>
          <label className={form.label}>NIK Ayah (Father's National Identification Number)</label>
          <input className={form.input} name="nik_ayah" value={formData.nik_ayah || ""} onChange={handleChange} />
        </div>

        <div className={form.formGroup}>
          <label className={form.label}>Nama Ayah (Father's Name) *</label>
          <input className={form.input} name="nama_ayah" value={formData.nama_ayah || ""} onChange={handleChange} />
        </div>

        <div className={form.formGroup}>
          <label className={form.label}>Tanggal Lahir Ayah (Father's Date of Birth)</label>
          <input type="date" className={form.input} name="tanggallahir_ayah" value={formData.tanggallahir_ayah || ""} onChange={handleChange} />
        </div>

        <div className={form.formGroup}>
          <label className={form.label}>No Telepon Ayah (Father's Phone Number) *</label>
          <input className={form.input} name="notelp_ayah" value={formData.notelp_ayah || ""} onChange={handleChange} />
        </div>

        {renderSelect("Pendidikan Terakhir Ayah (Father's Highest Education)", "pendidikan_ayah", "Pendidikan Terakhir (Father's Highest Education)", PENDIDIKAN_OPTIONS)}
        {renderSelect("Pekerjaan Ayah (Father's Occupation)", "pekerjaan_ayah", "Pekerjaan (Father's Occupation)", PEKERJAAN_OPTIONS)}
        {renderSelect("Pendapatan Ayah (Father's Income)", "penghasilan_ayah", "Pendapatan (Father's Income)", PENGHASILAN_OPTIONS)}

        <div className={form.formGroup}>
          <label className={form.label}>Status Ayah (Father's Vital Status)</label>
          <div className={form.selectWrapper}>
            <select className={form.select} name="status_ayah" value={formData.status_ayah || ""} onChange={handleChange}>
              <option value="">Status Ayah (Father's Vital Status)</option>
              <option value="n">Hidup (Alive)</option>
              <option value="y">Meninggal (Deceased)</option>
            </select>
          </div>
        </div>

        {/* ================= IBU ================= */}
        <h2 className={styles.sectionHeading}>BIODATA IBU (BIOLOGICAL MOTHER)</h2>

        <div className={form.formGroup}>
          <label className={form.label}>NIK Ibu (Mother's National Identification Number)</label>
          <input className={form.input} name="nik_ibu" value={formData.nik_ibu || ""} onChange={handleChange} />
        </div>

        <div className={form.formGroup}>
          <label className={form.label}>Nama Ibu (Mother's Name) *</label>
          <input className={form.input} name="nama_ibu" value={formData.nama_ibu || ""} onChange={handleChange} />
        </div>

        <div className={form.formGroup}>
          <label className={form.label}>Tanggal Lahir Ibu (Mother's Date of Birth)</label>
          <input type="date" className={form.input} name="tanggallahir_ibu" value={formData.tanggallahir_ibu || ""} onChange={handleChange} />
        </div>

        <div className={form.formGroup}>
          <label className={form.label}>No Telepon Ibu (Mother's Phone Number) *</label>
          <input className={form.input} name="notelp_ibu" value={formData.notelp_ibu || ""} onChange={handleChange} />
        </div>

        {renderSelect("Pendidikan Terakhir Ibu (Mother's Highest Education)", "pendidikan_ibu", "Pendidikan Terakhir (Mother's Highest Education)", PENDIDIKAN_OPTIONS)}
        {renderSelect("Pekerjaan Ibu (Mother's Occupation)", "pekerjaan_ibu", "Pekerjaan (Mother's Occupation)", PEKERJAAN_OPTIONS)}
        {renderSelect("Pendapatan Ibu (Mother's Income)", "penghasilan_ibu", "Pendapatan (Mother's Income)", PENGHASILAN_OPTIONS)}

        <div className={form.formGroup}>
          <label className={form.label}>Status Ibu (Mother's Vital Status)</label>
          <div className={form.selectWrapper}>
            <select className={form.select} name="status_ibu" value={formData.status_ibu || ""} onChange={handleChange}>
              <option value="">Status Ibu (Mother's Vital Status)</option>
              <option value="n">Hidup (Alive)</option>
              <option value="y">Meninggal (Deceased)</option>
            </select>
          </div>
        </div>

        {/* ALAMAT ORTU */}
        <div className={form.formGroup}>
          <label className={form.label}>Alamat OrangTua (Parents' Home Address)</label>
          <input className={form.input} name="alamat_ortu" value={formData.alamat_ortu || ""} onChange={handleChange} />
        </div>

        {/* BUTTON */}
        <div className={form.buttonGroup}>
          <button className={`${form.btn} ${form.btnDanger}`} onClick={prev}>
            Kembali (Back)
          </button>
          <button className={`${form.btn} ${form.btnPrimary}`} onClick={handleNext}>
            Selanjutnya (Next)
          </button>
        </div>

      </div>
    </div>
  );
}