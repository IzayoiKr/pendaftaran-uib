import { useState } from "react";
import styles from "./Step1.module.scss";
import useSchoolSearch from "../../hooks/useSchoolSearch";
import useUniversitySearch from "../../hooks/useUniversitySearch";

type Props = {
  formData: any;
  setFormData: (data: any) => void;
  next: () => void;
};

// Daftar semua prodi sesuai website asli
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

export default function Step1S1({ formData, setFormData, next }: Props) {
  const [jenisDaftar, setJenisDaftar] = useState(formData.jenisdaftar || "");

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
    if (!formData.nik || !formData.email || !formData.nama || !formData.nohp) {
      alert("Lengkapi data wajib!");
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
      {/* ================= FORM ================= */}
      <div className={styles.formWrapper}>

        {/* HEADER */}
        <div className={styles.header}>
          <h1 className={styles.mainTitle}>
            FORM PENDAFTARAN CALON MAHASISWA PROGRAM STRATA SATU
          </h1>
          <p className={styles.subTitle}>
            (Undergraduate Student Registration Form)
          </p>

          <div className={styles.steps}>
            <div className={`${styles.step} ${styles.active}`}>
              <div className={styles.circle}>1</div>
              <p>BIODATA DIRI</p>
              <span>(PERSONAL DATA)</span>
            </div>
            <div className={styles.step}>
              <div className={styles.circle}>2</div>
              <p>DOKUMEN</p>
              <span>(DOCUMENT)</span>
            </div>
            <div className={styles.step}>
              <div className={styles.circle}>3</div>
              <p>SELESAI</p>
              <span>(DONE)</span>
            </div>
          </div>
        </div>

        <h2 className={styles.title}>BIODATA PRIBADI (Personal Data)</h2>
        <p className={styles.requiredNote}>* Wajib di Isi (Required)</p>

        {/* NIK */}
        <div className={styles.formGroup}>
          <label className={styles.label}>NIK (National Identification Number) *</label>
          <input
            className={styles.input}
            name="nik"
            value={formData.nik || ""}
            onChange={handleChange}
          />
        </div>

        {/* EMAIL */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Email *</label>
          <input
            className={styles.input}
            type="email"
            name="email"
            value={formData.email || ""}
            onChange={handleChange}
          />
        </div>

        {/* NAMA */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Nama Lengkap (Full Name) *</label>
          <input
            className={styles.input}
            name="nama"
            value={formData.nama || ""}
            onChange={handleChange}
          />
        </div>

        {/* JENIS KELAMIN */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Jenis Kelamin (Gender) *</label>
        <div className={styles.selectWrapper}>
          <select
            className={styles.select}
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

        {/* KEWARGANEGARAAN — nilai angka sesuai backend */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Kewarganegaraan (Nationality) *</label>
        <div className={styles.selectWrapper}>
          <select
            className={styles.select}
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
        <div className={styles.row}>
          <div className={styles.col}>
            <label className={styles.label}>Tempat Lahir (Place of Birth) *</label>
            <input
              className={styles.input}
              name="tempatlahir"
              value={formData.tempatlahir || ""}
              onChange={handleChange}
            />
          </div>

          <div className={styles.col}>
            <label className={styles.label}>Tanggal Lahir (Date of Birth) *</label>
            <input
              className={styles.input}
              type="date"
              name="tanggallahir"
              max="2011-03-26"
              value={formData.tanggallahir || ""}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* NO HP */}
        <div className={styles.formGroup}>
          <label className={styles.label}>No. Hp (First Phone Number) *</label>
          <input
            className={styles.input}
            type="number"
            name="nohp"
            value={formData.nohp || ""}
            onChange={handleChange}
          />
        </div>

        {/* NO WA */}
        <div className={styles.formGroup}>
          <label className={styles.label}>No. WA (WhatsApp Number) *</label>
          <input
            className={styles.input}
            type="number"
            name="nohp2"
            value={formData.nohp2 || ""}
            onChange={handleChange}
          />
        </div>

        {/* JENIS PENDAFTARAN */}
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Jenis Pendaftaran (Registration Type) *
          </label>
        <div className={styles.selectWrapper}>
          <select
            className={styles.select}
            name="jenisdaftar"
            value={jenisDaftar}
            onChange={(e) => {
              handleChange(e);
              setJenisDaftar(e.target.value);
            }}
          >
            <option value="">Jenis Pendaftaran (Registration Type) *</option>
            <option value="baru">Baru (Newly Registered)</option>
            <option value="alihjenjang">Alih Jenjang (Extension Course)</option>
            <option value="transfer">Transfer (Transfer Student)</option>
          </select>
        </div>
      </div>

        {/* ===== EXTRA FORM: Alih Jenjang / Transfer ===== */}
        {isAlihjenjangOrTransfer && (
          <div className={styles.extraBox}>
            <h3 className={styles.sectionTitle}>
              Informasi Pendidikan Sebelumnya (Prior Education Information)
            </h3>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            Nama Universitas (Name of University) *
          </label>

          <div className={styles.selectWrapper}>
            <input
              className={styles.input}
              name="universitas_asal"
              value={queryUni}
              placeholder="Masukan nama Universitas (Name Of University)"
              onFocus={() => setOpenUni(true)}
              onBlur={() => setTimeout(() => setOpenUni(false), 200)}
              onChange={(e) => {
                const val = e.target.value;

                setQueryUni(val);

                setFormData({
                  ...formData,
                  universitas_asal: val,
                });
              }}
            />

            {openUni && (
              <div className={styles.dropdown}>
                {queryUni.length < 3 ? (
                  <div className={styles.notFound}>
                    Please enter 3 or more characters
                  </div>
                ) : filteredUni.length === 0 ? (
                  <div className={styles.notFound}>
                    Universitas tidak ditemukan
                  </div>
                ) : (
                  filteredUni.map((u: string, i: number) => (
                    <div
                      key={i}
                      className={styles.option}
                      onMouseDown={() => {
                        setQueryUni(u);

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

            <div className={styles.formGroup}>
              <label className={styles.label}>Asal Program Studi (Last Study Program) *</label>
              <input
                className={styles.input}
                name="prodi_asal"
                value={formData.prodi_asal || ""}
                onChange={handleChange}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>IPK (GPA) *</label>
            <div className={styles.selectWrapper}>
              <input
                className={styles.input}
                type="number"
                step="0.01"
                max={4}
                name="ipk"
                value={formData.ipk || ""}
                onChange={handleChange}
              />
            </div>
          </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Jenjang Pendidikan Terakhir (Last Education Level) *
              </label>
              <div className={styles.selectWrapper}>
              <input
                className={styles.input}
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

        {/* NAMA UNIVERSITAS — search dropdown */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Nama Universitas *</label>
          <div className={styles.selectWrapper}>
            <input
              className={styles.input}
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
              <div className={styles.dropdown}>
                {filteredUni.length === 0 ? (
                  <div className={styles.notFound}>Universitas tidak ditemukan</div>
                ) : (
                  filteredUni.map((u: string, i: number) => (
                    <div
                      key={i}
                      className={styles.option}
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

        <div className={styles.formGroup}>
          <label className={styles.label}>
            Program Studi Pilihan (First Selected Study Program) *
          </label>
        <div className={styles.selectWrapper}>
          <select
            className={styles.select}
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

        <div className={styles.formGroup}>
          <label className={styles.label}>
            Program Studi Pilihan 2 (Second Selected Study Program)
          </label>
        <div className={styles.selectWrapper}>
          <select
            className={styles.select}
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

        <div className={styles.formGroup}>
          <label className={styles.label}>
            Program Studi Pilihan 3 (Third Selected Study Program)
          </label>
        <div className={styles.selectWrapper}>
          <select
            className={styles.select}
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

        <div className={styles.formGroup}>
          <label className={styles.label}>Waktu Kuliah (Shift) *</label>
        <div className={styles.selectWrapper}>
          <select
            className={styles.select}
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

        <div className={styles.formGroup}>
          <label className={styles.label}>Nama Asal Sekolah (Name of High School) *</label>

          <div className={styles.selectWrapper}>
            <input
              className={styles.input}
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
              <div className={styles.dropdown}>
                {filtered.length === 0 ? (
                  <div className={styles.notFound}>Sekolah tidak ditemukan*</div>
                ) : (
                  filtered.map((s, i) => (
                    <div
                      key={i}
                      className={styles.option}
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
          <div className={styles.extraBox}>
            <label className={styles.checkbox}>
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
        <div className={styles.buttonGroup}>
          <button type="button" className={styles.cancel}>
            Batal (Cancel)
          </button>
          <button type="button" className={styles.next} onClick={handleNext}>
            Selanjutnya (Next)
          </button>
        </div>
      </div>
    </div>
  );
}
