import { useState } from "react";
import styles from "./Step1.module.scss";
import form from "../../styles/form.module.scss";
import ProgressBar from "../../hooks/ProgressBar";
import useSchoolSearch from "../../hooks/useSchoolSearch";
import useUniversitySearch from "../../hooks/useUniversitySearch";

type Props = {
  formData: any;
  setFormData: (data: any) => void;
  next: () => void;
  goToStep: (n: number) => void;
  currentStep: number;
};

const PRODI_OPTIONS = [
  { value: "42", label: "Akuntansi (Accounting)" },
  { value: "12", label: "Arsitektur (Architecture)" },
  { value: "71", label: "Biologi (Biology)" },
  { value: "72", label: "Gizi (Nutrition)" },
  { value: "51", label: "Ilmu Hukum (Law Science)" },
  { value: "81", label: "Kedokteran (Medicine)" },
  { value: "41", label: "Manajemen (Management)" },
  { value: "46", label: "Pariwisata (Tourism)" },
  { value: "61", label: "Pendidikan Bahasa Inggris (English Language Education)" },
  { value: "82", label: "Profesi Kedokteran (Medicine)" },
  { value: "31", label: "Sistem Informasi (Information System)" },
  { value: "11", label: "Teknik Sipil (Civil Engineering)" },
  { value: "32", label: "Teknologi Informasi (Information Technology)" },
];

export default function Step1S1({
  formData,
  setFormData,
  next,
  goToStep,
  currentStep,
}: Props) {
  const [jenisDaftar, setJenisDaftar] = useState(
    formData.jenisdaftar || ""
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleNext = () => {
    const required = ["nik", "email", "nama", "nohp"];

    const missing = required.filter((f) => !formData[f]);

    if (missing.length > 0) {
      alert(`Field wajib belum diisi: ${missing.join(", ")}`);
      return;
    }

    next();
  };

  const {
    query,
    setQuery,
    open,
    setOpen,
    filtered,
    selectSchool,
  } = useSchoolSearch(setFormData);

  const {
    queryUni,
    setQueryUni,
    openUni,
    setOpenUni,
    filteredUni,
    selectUniversity,
  } = useUniversitySearch(setFormData);

  const isAlihjenjangOrTransfer =
    jenisDaftar === "alihjenjang" || jenisDaftar === "transfer";

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

        <h2 className={styles.title}>BIODATA PRIBADI (Personal Data)</h2>
        <p className={styles.requiredNote}>* Wajib di Isi (Required)</p>

        {/* NIK */}
        <div className={form.formGroup}>
          <label className={form.label}>NIK (National Identification Number) *</label>
          <input
            className={form.input}
            name="nik"
            value={formData.nik || ""}
            onChange={handleChange}
          />
        </div>

        {/* EMAIL */}
        <div className={form.formGroup}>
          <label className={form.label}>Email *</label>
          <input
            className={form.input}
            type="email"
            name="email"
            value={formData.email || ""}
            onChange={handleChange}
          />
        </div>

        {/* NAMA */}
        <div className={form.formGroup}>
          <label className={form.label}>Nama Lengkap (Full Name) *</label>
          <input
            className={form.input}
            name="nama"
            value={formData.nama || ""}
            onChange={handleChange}
          />
        </div>

        {/* JENIS KELAMIN */}
        <div className={form.formGroup}>
          <label className={form.label}>Jenis Kelamin (Gender) *</label>
          <div className={form.selectWrapper}>
            <select
              className={form.select}
              name="jk"
              value={formData.jk || ""}
              onChange={handleChange}
            >
              <option value="">Jenis Kelamin (Gender) *</option>
              <option value="l">Laki - Laki (Male)</option>
              <option value="p">Perempuan (Female)</option>
            </select>
          </div>
        </div>

        {/* KEWARGANEGARAAN */}
        <div className={form.formGroup}>
          <label className={form.label}>Kewarganegaraan (Nationality) *</label>
          <div className={form.selectWrapper}>
            <select
              className={form.select}
              name="kewarganegaraan"
              value={formData.kewarganegaraan || ""}
              onChange={handleChange}
            >
              <option value="">Kewarganegaraan (Nationality) *</option>
              <option value="1">WNI</option>
              <option value="2">WNA</option>
              <option value="3">TIDAK ADA WN</option>
            </select>
          </div>
        </div>

        {/* TEMPAT & TANGGAL LAHIR */}
        <div className={form.row}>
          <div className={form.col}>
            <label className={form.label}>Tempat Lahir (Place of Birth) *</label>
            <input
              className={form.input}
              name="tempatlahir"
              value={formData.tempatlahir || ""}
              onChange={handleChange}
            />
          </div>

          <div className={form.col}>
            <label className={form.label}>Tanggal Lahir (Date of Birth) *</label>
            <input
              className={form.input}
              type="date"
              name="tanggallahir"
              max="2011-03-26"
              value={formData.tanggallahir || ""}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* NO HP */}
        <div className={form.formGroup}>
          <label className={form.label}>No. Hp (First Phone Number) *</label>
          <input
            className={form.input}
            type="number"
            name="nohp"
            value={formData.nohp || ""}
            onChange={handleChange}
          />
        </div>

        {/* NO WA */}
        <div className={form.formGroup}>
          <label className={form.label}>No. WA (WhatsApp Number) *</label>
          <input
            className={form.input}
            type="number"
            name="nohp2"
            value={formData.nohp2 || ""}
            onChange={handleChange}
          />
        </div>

        {/* JENIS PENDAFTARAN */}
        <div className={form.formGroup}>
          <label className={form.label}>Jenis Pendaftaran (Registration Type) *</label>
          <div className={form.selectWrapper}>
            <select
              className={form.select}
              name="jenisdaftar"
              value={jenisDaftar}
              onChange={(e) => {
                handleChange(e);
                setJenisDaftar(e.target.value);
              }}
            >
              <option value="">Jenis Pendaftaran (Registration Type) *</option>
              <option value="baru">Baru (Newly Registered)</option>
              <option value="alihjenjang">Alih Jenjang (Change Level)</option>
              <option value="transfer">Transfer</option>
            </select>
          </div>
        </div>

        {/* DATA PENDIDIKAN SEBELUMNYA - hanya muncul jika Alih Jenjang atau Transfer */}
        {isAlihjenjangOrTransfer && (
          <div className={form.extraBox}>
            <h3>Data Pendidikan Sebelumnya (Previous Education Data)</h3>

            {/* UNIVERSITAS ASAL */}
            <div className={form.formGroup}>
              <label className={form.label}>Universitas Asal (Last University) *</label>
              <div className={form.selectWrapper}>
                <input
                  className={form.input}
                  name="universitas_asal"
                  value={queryUni}
                  placeholder="Masukkan nama Universitas"
                  onFocus={() => setOpenUni(true)}
                  onBlur={() => setTimeout(() => setOpenUni(false), 150)}
                  onChange={(e) => {
                    setQueryUni(e.target.value);
                    setFormData({
                      ...formData,
                      universitas_asal: e.target.value,
                    });
                  }}
                />
                {openUni && (
                  <div className={form.dropdown}>
                    {filteredUni.length === 0 ? (
                      <div className={form.notFound}>Universitas tidak ditemukan</div>
                    ) : (
                      filteredUni.map((u: string, i: number) => (
                        <div
                          key={i}
                          className={form.option}
                          onMouseDown={() => {
                            selectUniversity(u);
                            setFormData({
                              ...formData,
                              universitas_asal: u,
                            });
                            setOpenUni(false);
                          }}
                        >
                          {u}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ASAL PROGRAM STUDI */}
            <div className={form.formGroup}>
              <label className={form.label}>Asal Program Studi (Last Study Program) *</label>
              <input
                className={form.input}
                name="prodi_asal"
                value={formData.prodi_asal || ""}
                onChange={handleChange}
              />
            </div>

            {/* IPK */}
            <div className={form.formGroup}>
              <label className={form.label}>IPK (GPA) *</label>
              <div className={form.selectWrapper}>
                <input
                  className={form.input}
                  type="number"
                  step="0.01"
                  max={4}
                  name="ipk"
                  value={formData.ipk || ""}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* JENJANG PENDIDIKAN TERAKHIR */}
            <div className={form.formGroup}>
              <label className={form.label}>
                Jenjang Pendidikan Terakhir (Last Education Level) *
              </label>
              <div className={form.selectWrapper}>
                <input
                  className={form.input}
                  name="jenjang_pendidikan"
                  value={formData.jenjang_pendidikan || ""}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        )}

        {/* ===== INFORMASI PERKULIAHAN ===== */}
        <h3 className={styles.sectionTitle}>Informasi Perkuliahan (Study Program)</h3>

        {/* NAMA UNIVERSITAS */}
        <div className={form.formGroup}>
          <label className={form.label}>Nama Universitas *</label>
          <div className={form.selectWrapper}>
            <input
              className={form.input}
              name="universitas"
              value={queryUni}
              placeholder="Masukkan nama Universitas"
              onFocus={() => setOpenUni(true)}
              onBlur={() => setTimeout(() => setOpenUni(false), 150)}
              onChange={(e) => {
                setQueryUni(e.target.value);
                handleChange(e);
              }}
            />
            {openUni && (
              <div className={form.dropdown}>
                {filteredUni.length === 0 ? (
                  <div className={form.notFound}>Universitas tidak ditemukan</div>
                ) : (
                  filteredUni.map((u: string, i: number) => (
                    <div
                      key={i}
                      className={form.option}
                      onMouseDown={() => selectUniversity(u)}
                    >
                      {u}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* PROGRAM STUDI PILIHAN 1 */}
        <div className={form.formGroup}>
          <label className={form.label}>
            Program Studi Pilihan (First Selected Study Program) *
          </label>
          <div className={form.selectWrapper}>
            <select
              className={form.select}
              name="prodipil"
              value={formData.prodipil || ""}
              onChange={handleChange}
            >
              <option value="">Program Studi Pilihan (Selected Study Program) *</option>
              {PRODI_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* PROGRAM STUDI PILIHAN 2 */}
        <div className={form.formGroup}>
          <label className={form.label}>
            Program Studi Pilihan 2 (Second Selected Study Program)
          </label>
          <div className={form.selectWrapper}>
            <select
              className={form.select}
              name="prodipil2"
              value={formData.prodipil2 || ""}
              onChange={handleChange}
            >
              <option value="">Program Studi Pilihan 2 (Second Selected Study Program)</option>
              {PRODI_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* PROGRAM STUDI PILIHAN 3 */}
        <div className={form.formGroup}>
          <label className={form.label}>
            Program Studi Pilihan 3 (Third Selected Study Program)
          </label>
          <div className={form.selectWrapper}>
            <select
              className={form.select}
              name="prodipil3"
              value={formData.prodipil3 || ""}
              onChange={handleChange}
            >
              <option value="">Program Studi Pilihan 3 (Third Selected Study Program)</option>
              {PRODI_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* WAKTU KULIAH */}
        <div className={form.formGroup}>
          <label className={form.label}>Waktu Kuliah (Shift) *</label>
          <div className={form.selectWrapper}>
            <select
              className={form.select}
              name="waktukuliah"
              value={formData.waktukuliah || ""}
              onChange={handleChange}
            >
              <option value="">Waktu Kuliah (Shift) *</option>
              <option value="pagi">Pagi (Morning Class)</option>
              <option value="malam">Malam (Night Class)</option>
            </select>
          </div>
        </div>

        {/* ===== INFORMASI SEKOLAH ===== */}
        <h3 className={styles.sectionTitle}>
          Informasi Sekolah (High School Information)
        </h3>

        {/* NAMA ASAL SEKOLAH */}
        <div className={form.formGroup}>
          <label className={form.label}>Nama Asal Sekolah (Name of High School) *</label>

          <div className={form.selectWrapper}>
            <input
              className={form.input}
              name="asal_sekolah"
              value={query}
              placeholder="Masukkan nama sekolah (Name Of High-School)"
              onFocus={() => setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 150)}
              onChange={(e) => {
                setQuery(e.target.value);
                handleChange(e);
              }}
            />

            {open && (
              <div className={form.dropdown}>
                {filtered.length === 0 ? (
                  <div className={form.notFound}>Sekolah tidak ditemukan*</div>
                ) : (
                  filtered.map((s, i) => (
                    <div
                      key={i}
                      className={form.option}
                      onMouseDown={() => selectSchool(s)}
                    >
                      {s}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* CHECKBOX — hanya muncul saat "baru" */}
        {jenisDaftar === "baru" && (
          <div className={form.extraBox}>
            <label className={form.checkbox}>
              <input
                type="checkbox"
                name="konfirmasi"
                checked={formData.konfirmasi || false}
                onChange={handleChange}
              />
              Dengan ini saya menyatakan bahwa saya siswa yang belum pernah
              mengikuti perkuliahan pada perguruan tinggi lain (I Hearby Declare
              that i am a student that have not attended any lectures from another
              institution).
            </label>
          </div>
        )}

        {/* BUTTON */}
        <div className={form.buttonGroup}>
          <button className={`${form.btn} ${form.btnDanger}`}>
            Batal
          </button>
          <button
            className={`${form.btn} ${form.btnPrimary}`}
            onClick={handleNext}
          >
            Selanjutnya
          </button>
        </div>

      </div>
    </div>
  );
}
