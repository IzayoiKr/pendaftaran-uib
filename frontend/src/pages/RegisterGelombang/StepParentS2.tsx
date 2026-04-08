import styles from "./Step2.module.scss";
import form from "../../styles/form.module.scss";
import ProgressBar from "../../hooks/ProgressBar";

type Props = {
  formData: any;
  setFormData: (data: any) => void;
  next: () => void;
  prev: () => void;
  goToStep: (n: number) => void;
  currentStep: number;
};

const PENDIDIKAN_OPTIONS = [
  { value: "D1", label: "Diploma 1" },
  { value: "D2", label: "Diploma 2" },
  { value: "D3", label: "Diploma 3" },
  { value: "D4", label: "Diploma 4" },
  { value: "NON-AKAD", label: "NON-AKADEMIK" },
  { value: "PR", label: "Profesi" },
  { value: "Sp-1", label: "Spesialis 1" },
  { value: "Sp-2", label: "Spesialis 2" },
  { value: "S1", label: "Strata 1" },
  { value: "S2", label: "Strata 2" },
  { value: "S3", label: "Strata 3" },
  { value: "TAMAT SD", label: "TAMAT SD" },
  { value: "TAMAT SMA", label: "TAMAT SMA" },
  { value: "TAMAT SMP", label: "TAMAT SMP" },
  { value: "TDK TMT SD", label: "TIDAK TAMAT SD" },
];

const PEKERJAAN_OPTIONS = [
  { value: "3", label: "ABRI" },
  { value: "14", label: "AHLI/PROF.BEKRJ PERORANGA" },
  { value: "16", label: "BURUH" },
  { value: "8", label: "GURU/DOSEN NEGERI" },
  { value: "11", label: "GURU/DOSEN SWASTA" },
  { value: "19", label: "IBU RUMAH TANGGA" },
  { value: "2", label: "KARYAWAN SWASTA" },
  { value: "7", label: "LAIN-LAIN" },
  { value: "13", label: "PEDAGANG/WIRASWASTA" },
  { value: "12", label: "PEG.SWASTA NON GURU/DOSEN" },
  { value: "1", label: "PEGAWAI NEGERI" },
  { value: "6", label: "PENSIUNAN" },
  { value: "18", label: "PENSIUNAN PEG.SWASTA" },
  { value: "17", label: "PENSIUNAN PNS/TNI" },
  { value: "15", label: "PETANI/NELAYAN" },
  { value: "9", label: "PNS NON GURU/DOSEN" },
  { value: "20", label: "POLISI" },
  { value: "21", label: "Tidak Terisi" },
  { value: "10", label: "TNI" },
  { value: "5", label: "WIRASWASTA" },
];

const PENGHASILAN_OPTIONS = [
  { value: "1", label: "100.000 - 500.000" },
  { value: "2", label: "500.000 - 1.000.000" },
  { value: "3", label: "1.000.000 - 2.500.000" },
  { value: "4", label: "2.500.000 - 5.000.000" },
  { value: "5", label: "5.000.000 - 7.500.000" },
  { value: "6", label: "7.500.000 - 10.000.000" },
  { value: "7", label: "> 10.000.000" },
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
    setFormData({
      ...formData,
      [name]: value,
    });
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
              { label: "BIODATA ORANGTUA", sub: "PARENTAL DATA" },
              { label: "DOKUMEN", sub: "DOCUMENT" },
              { label: "SELESAI", sub: "DONE" },
            ]}
          />
        </div>

        {/* ================= AYAH ================= */}
        <h2 className={styles.sectionHeading}>BIODATA AYAH (BIOLOGICAL FATHER)</h2>

        <div className={form.formGroup}>
          <label className={form.label}>NIK Ayah (Father's National Identification Number)</label>
          <input
            className={form.input}
            name="nik_ayah"
            value={formData.nik_ayah || ""}
            onChange={handleChange}
          />
        </div>

        <div className={form.formGroup}>
          <label className={form.label}>Nama Ayah (Father's Name) *</label>
          <input
            className={form.input}
            name="nama_ayah"
            value={formData.nama_ayah || ""}
            onChange={handleChange}
          />
        </div>

        <div className={form.formGroup}>
          <label className={form.label}>Tanggal Lahir Ayah (Father's Date of Birth)</label>
          <input
            type="date"
            className={form.input}
            name="tanggallahir_ayah"
            value={formData.tanggallahir_ayah || ""}
            onChange={handleChange}
          />
        </div>

        <div className={form.formGroup}>
          <label className={form.label}>No Telepon Ayah (Father's Phone Number) *</label>
          <input
            className={form.input}
            name="notelp_ayah"
            value={formData.notelp_ayah || ""}
            onChange={handleChange}
          />
        </div>

        <div className={form.formGroup}>
          <label className={form.label}>Pendidikan Terakhir Ayah (Father's Highest Education)</label>
          <div className={form.selectWrapper}>
            <select
              className={form.select}
              name="pendidikan_ayah"
              value={formData.pendidikan_ayah || ""}
              onChange={handleChange}
            >
              <option value="">Pendidikan Terakhir (Father's Highest Education)</option>
              {PENDIDIKAN_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className={form.formGroup}>
          <label className={form.label}>Pekerjaan Ayah (Father's Occupation)</label>
          <div className={form.selectWrapper}>
            <select
              className={form.select}
              name="pekerjaan_ayah"
              value={formData.pekerjaan_ayah || ""}
              onChange={handleChange}
            >
              <option value="">Pekerjaan (Father's Occupation)</option>
              {PEKERJAAN_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className={form.formGroup}>
          <label className={form.label}>Pendapatan Ayah (Father's Income)</label>
          <div className={form.selectWrapper}>
            <select
              className={form.select}
              name="penghasilan_ayah"
              value={formData.penghasilan_ayah || ""}
              onChange={handleChange}
            >
              <option value="">Pendapatan (Father's Income)</option>
              {PENGHASILAN_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className={form.formGroup}>
          <label className={form.label}>Status Ayah (Father's Vital Status)</label>
          <div className={form.selectWrapper}>
            <select
              className={form.select}
              name="status_ayah"
              value={formData.status_ayah || ""}
              onChange={handleChange}
            >
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
          <input
            className={form.input}
            name="nik_ibu"
            value={formData.nik_ibu || ""}
            onChange={handleChange}
          />
        </div>

        <div className={form.formGroup}>
          <label className={form.label}>Nama Ibu (Mother's Name) *</label>
          <input
            className={form.input}
            name="nama_ibu"
            value={formData.nama_ibu || ""}
            onChange={handleChange}
          />
        </div>

        <div className={form.formGroup}>
          <label className={form.label}>Tanggal Lahir Ibu (Mother's Date of Birth)</label>
          <input
            type="date"
            className={form.input}
            name="tanggallahir_ibu"
            value={formData.tanggallahir_ibu || ""}
            onChange={handleChange}
          />
        </div>

        <div className={form.formGroup}>
          <label className={form.label}>No Telepon Ibu (Mother's Phone Number) *</label>
          <input
            className={form.input}
            name="notelp_ibu"
            value={formData.notelp_ibu || ""}
            onChange={handleChange}
          />
        </div>

        <div className={form.formGroup}>
          <label className={form.label}>Pendidikan Terakhir Ibu (Mother's Highest Education)</label>
          <div className={form.selectWrapper}>
            <select
              className={form.select}
              name="pendidikan_ibu"
              value={formData.pendidikan_ibu || ""}
              onChange={handleChange}
            >
              <option value="">Pendidikan Terakhir (Mother's Highest Education)</option>
              {PENDIDIKAN_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className={form.formGroup}>
          <label className={form.label}>Pekerjaan Ibu (Mother's Occupation)</label>
          <div className={form.selectWrapper}>
            <select
              className={form.select}
              name="pekerjaan_ibu"
              value={formData.pekerjaan_ibu || ""}
              onChange={handleChange}
            >
              <option value="">Pekerjaan (Mother's Occupation)</option>
              {PEKERJAAN_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className={form.formGroup}>
          <label className={form.label}>Pendapatan Ibu (Mother's Income)</label>
          <div className={form.selectWrapper}>
            <select
              className={form.select}
              name="penghasilan_ibu"
              value={formData.penghasilan_ibu || ""}
              onChange={handleChange}
            >
              <option value="">Pendapatan (Mother's Income)</option>
              {PENGHASILAN_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className={form.formGroup}>
          <label className={form.label}>Status Ibu (Mother's Vital Status)</label>
          <div className={form.selectWrapper}>
            <select
              className={form.select}
              name="status_ibu"
              value={formData.status_ibu || ""}
              onChange={handleChange}
            >
              <option value="">Status Ibu (Mother's Vital Status)</option>
              <option value="n">Hidup (Alive)</option>
              <option value="y">Meninggal (Deceased)</option>
            </select>
          </div>
        </div>

        {/* ================= ALAMAT ================= */}
        <div className={form.formGroup}>
          <label className={form.label}>Alamat OrangTua (Parents' Home Address)</label>
          <input
            className={form.input}
            name="alamat_ortu"
            value={formData.alamat_ortu || ""}
            onChange={handleChange}
          />
        </div>

        {/* ================= BUTTON ================= */}
        <div className={form.buttonGroup}>
          <button
            className={`${form.btn} ${form.btnDanger}`}
            onClick={prev}
          >
            Kembali (Back)
          </button>

          <button
            className={`${form.btn} ${form.btnPrimary}`}
            onClick={handleNext}
          >
            Selanjutnya (Next)
          </button>
        </div>

      </div>
    </div>
  );
}
