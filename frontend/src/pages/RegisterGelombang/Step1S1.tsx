import { useState } from "react";
import styles from "./Step1.module.scss";
import form from "../../styles/form.module.scss";
import ProgressBar from "../../hooks/ProgressBar";
import useSchoolSearch from "../../hooks/useSchoolSearch";
import useUniversitySearch from "../../hooks/useUniversitySearch";
import { PRODI_S1_OPTIONS } from "../../constants/registerOptions";

type Props = {
  formData: any;
  setFormData: (data: any) => void;
  next: () => void;
  goToStep: (n: number) => void;
  currentStep: number;
};

const S1_STEPS = [
  { label: "BIODATA DIRI", sub: "PERSONAL DATA" },
  { label: "DOKUMEN",      sub: "DOCUMENT" },
  { label: "SELESAI",      sub: "DONE" },
];

// ✅ STRICT VALIDATION
const validateField = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  if (typeof value === "boolean" && !value) return false;
  if (typeof value === "number" && value === 0) return false;
  return true;
};

const validateEmailFormat = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateNIK = (nik: string): boolean => {
  return /^\d{16}$/.test(nik);
};

const validatePhoneNumber = (phone: string): boolean => {
  return /^\d+$/.test(phone) && phone.length >= 10;
};

const validateIPK = (ipk: string): boolean => {
  const ipkNum = parseFloat(ipk);
  return !isNaN(ipkNum) && ipkNum >= 0 && ipkNum <= 4;
};

export default function Step1S1({
  formData,
  setFormData,
  next,
  goToStep,
  currentStep,
}: Props) {
  const [jenisDaftar, setJenisDaftar] = useState(formData.jenisdaftar || "");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleNext = () => {
    const required = [
      "nik",
      "email",
      "nama",
      "jk",
      "kewarganegaraan",
      "tempatlahir",
      "tanggallahir",
      "nohp",
      "nohp2",
      "jenisdaftar",
      "universitas",
      "prodipil",
      "waktukuliah",
      "asal_sekolah",
    ];

    if (jenisDaftar === "baru") {
      required.push("konfirmasi");
    }

    if (jenisDaftar === "alihjenjang" || jenisDaftar === "transfer") {
      required.push("universitas_asal", "prodi_asal", "ipk", "jenjang_pendidikan");
    }

    // ✅ STRICT — checks truly filled
    const missing = required.filter((f) => !validateField(formData[f]));

    if (missing.length > 0) {
      alert(`❌ Field wajib belum diisi:\n\n${missing.join("\n")}`);
      return;
    }

    if (!validateEmailFormat(formData.email)) {
      alert("❌ Email tidak valid. Silakan gunakan format yang benar (contoh: nama@email.com)");
      return;
    }

    if (!validateNIK(formData.nik)) {
      alert("❌ NIK harus berupa angka dan tepat 16 digit.");
      return;
    }

    if (!validatePhoneNumber(formData.nohp)) {
      alert("❌ No. HP harus berupa angka dan minimal 10 digit.");
      return;
    }

    if (!validatePhoneNumber(formData.nohp2)) {
      alert("❌ No. WA harus berupa angka dan minimal 10 digit.");
      return;
    }

    if (jenisDaftar === "alihjenjang" || jenisDaftar === "transfer") {
      if (!validateIPK(formData.ipk)) {
        alert("❌ IPK harus berupa angka desimal antara 0 dan 4 (contoh: 3.45)");
        return;
      }
    }

    next();
  };

  // ✅ NEW hook signatures — (formData, setFormData)
  const {
    query,
    setQuery,
    open,
    setOpen,
    filtered,
    selectSchool,
  } = useSchoolSearch(formData, setFormData);

  const {
    queryUni,
    setQueryUni,
    openUni,
    setOpenUni,
    filteredUni,
    loading: loadingUni,
    selectUniversity,
  } = useUniversitySearch(formData, setFormData);

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
          <p className={styles.subTitle}>(Undergraduate Student Registration Form)</p>
          <ProgressBar currentStep={currentStep} goToStep={goToStep} steps={S1_STEPS} />
        </div>

        <h2 className={styles.title}>BIODATA PRIBADI (Personal Data)</h2>
        <p className={styles.requiredNote}>* Wajib di Isi (Required)</p>

        {/* NIK */}
        <div className={form.formGroup}>
          <label className={form.label}>NIK (National Identification Number) * (16 digit)</label>
          <input
            type="text"
            className={form.input}
            name="nik"
            value={formData.nik || ""}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "").slice(0, 16);
              setFormData({ ...formData, nik: value });
            }}
            inputMode="numeric"
            maxLength={16}
            placeholder="Contoh: 1234567890123456"
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
            placeholder="Contoh: nama@email.com"
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
            placeholder="Masukkan nama lengkap Anda"
          />
        </div>

        {/* JENIS KELAMIN */}
        <div className={form.formGroup}>
          <label className={form.label}>Jenis Kelamin (Gender) *</label>
          <div className={form.selectWrapper}>
            <select className={form.select} name="jk" value={formData.jk || ""} onChange={handleChange}>
              <option value="">Pilih Jenis Kelamin (Select Gender) *</option>
              <option value="l">Laki - Laki (Male)</option>
              <option value="p">Perempuan (Female)</option>
            </select>
          </div>
        </div>

        {/* KEWARGANEGARAAN */}
        <div className={form.formGroup}>
          <label className={form.label}>Kewarganegaraan (Nationality) *</label>
          <div className={form.selectWrapper}>
            <select className={form.select} name="kewarganegaraan" value={formData.kewarganegaraan || ""} onChange={handleChange}>
              <option value="">Pilih Kewarganegaraan (Select Nationality) *</option>
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
              placeholder="Masukkan kota kelahiran"
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
            placeholder="Contoh: 08123456789"
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
            placeholder="Contoh: 08123456789"
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
              <option value="">Pilih Jenis Pendaftaran (Select Registration Type) *</option>
              <option value="baru">Baru (Newly Registered)</option>
              <option value="alihjenjang">Alih Jenjang (Change Level)</option>
              <option value="transfer">Transfer</option>
            </select>
          </div>
        </div>

        {/* DATA PENDIDIKAN SEBELUMNYA — hanya muncul jika Alih Jenjang atau Transfer */}
        {isAlihjenjangOrTransfer && (
          <div className={form.extraBox}>
            <h3>Data Pendidikan Sebelumnya (Previous Education Data)</h3>

            {/* UNIVERSITAS ASAL — uses university search hook */}
            <div className={form.formGroup}>
              <label className={form.label}>Universitas Asal (Last University) *</label>
              <div className={form.selectWrapper}>
                <input
                  className={form.input}
                  name="universitas_asal"
                  value={queryUni}
                  placeholder="Ketik nama universitas (min. 2 huruf)..."
                  autoComplete="off"
                  onFocus={() => setOpenUni(true)}
                  onBlur={() => setTimeout(() => setOpenUni(false), 150)}
                  onChange={(e) => {
                    setQueryUni(e.target.value);
                    setFormData({ ...formData, universitas_asal: e.target.value });
                  }}
                />
                {openUni && queryUni.trim().length >= 2 && (
                  <div className={form.dropdown}>
                    {loadingUni ? (
                      <div className={form.notFound}>Mencari universitas...</div>
                    ) : (
                      filteredUni.map((u, i) => {
                        const isNotFound = u === "Universitas tidak ditemukan";
                        return (
                          <div
                            key={i}
                            className={`${form.option} ${isNotFound ? form.optionNotFound : ""}`}
                            onMouseDown={() => {
                              selectUniversity(u);
                              setFormData({ ...formData, universitas_asal: u });
                            }}
                          >
                            {isNotFound ? "⚠ Universitas tidak ditemukan" : u}
                          </div>
                        );
                      })
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
                placeholder="Masukkan nama program studi"
              />
            </div>

            {/* IPK */}
            <div className={form.formGroup}>
              <label className={form.label}>IPK (GPA) * (0.00 - 4.00)</label>
              <input
                className={form.input}
                type="number"
                step="0.01"
                min={0}
                max={4}
                name="ipk"
                value={formData.ipk || ""}
                onChange={handleChange}
                placeholder="Contoh: 3.45"
              />
            </div>

            {/* JENJANG PENDIDIKAN TERAKHIR */}
            <div className={form.formGroup}>
              <label className={form.label}>Jenjang Pendidikan Terakhir (Last Education Level) *</label>
              <input
                className={form.input}
                name="jenjang_pendidikan"
                value={formData.jenjang_pendidikan || ""}
                onChange={handleChange}
                placeholder="Contoh: S1"
              />
            </div>
          </div>
        )}

        {/* ===== INFORMASI PERKULIAHAN ===== */}
        <h3 className={styles.sectionTitle}>Informasi Perkuliahan (Study Program)</h3>

        {/* NAMA UNIVERSITAS — live API search */}
        <div className={form.formGroup}>
          <label className={form.label}>Nama Universitas *</label>
          <div className={form.selectWrapper}>
            <input
              className={form.input}
              name="universitas"
              value={queryUni}
              placeholder="Ketik nama universitas (min. 2 huruf)..."
              autoComplete="off"
              onFocus={() => setOpenUni(true)}
              onBlur={() => setTimeout(() => setOpenUni(false), 150)}
              onChange={(e) => setQueryUni(e.target.value)}
            />
            {openUni && queryUni.trim().length >= 2 && (
              <div className={form.dropdown}>
                {loadingUni ? (
                  <div className={form.notFound}>Mencari universitas...</div>
                ) : (
                  filteredUni.map((u, i) => {
                    const isNotFound = u === "Universitas tidak ditemukan";
                    return (
                      <div
                        key={i}
                        className={`${form.option} ${isNotFound ? form.optionNotFound : ""}`}
                        onMouseDown={() => selectUniversity(u)}
                      >
                        {isNotFound ? "⚠ Universitas tidak ditemukan" : u}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>

        {/* PROGRAM STUDI PILIHAN 1 */}
        <div className={form.formGroup}>
          <label className={form.label}>Program Studi Pilihan (First Selected Study Program) *</label>
          <div className={form.selectWrapper}>
            <select className={form.select} name="prodipil" value={formData.prodipil || ""} onChange={handleChange}>
              <option value="">Pilih Program Studi Pilihan *</option>
              {PRODI_S1_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* PROGRAM STUDI PILIHAN 2 */}
        <div className={form.formGroup}>
          <label className={form.label}>Program Studi Pilihan 2 (Second Selected Study Program)</label>
          <div className={form.selectWrapper}>
            <select className={form.select} name="prodipil2" value={formData.prodipil2 || ""} onChange={handleChange}>
              <option value="">Pilih Program Studi Pilihan 2</option>
              {PRODI_S1_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* PROGRAM STUDI PILIHAN 3 */}
        <div className={form.formGroup}>
          <label className={form.label}>Program Studi Pilihan 3 (Third Selected Study Program)</label>
          <div className={form.selectWrapper}>
            <select className={form.select} name="prodipil3" value={formData.prodipil3 || ""} onChange={handleChange}>
              <option value="">Pilih Program Studi Pilihan 3</option>
              {PRODI_S1_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* WAKTU KULIAH */}
        <div className={form.formGroup}>
          <label className={form.label}>Waktu Kuliah (Shift) *</label>
          <div className={form.selectWrapper}>
            <select className={form.select} name="waktukuliah" value={formData.waktukuliah || ""} onChange={handleChange}>
              <option value="">Pilih Waktu Kuliah (Select Shift) *</option>
              <option value="pagi">Pagi (Morning Class)</option>
              <option value="malam">Malam (Night Class)</option>
            </select>
          </div>
        </div>

        {/* ===== INFORMASI SEKOLAH ===== */}
        <h3 className={styles.sectionTitle}>Informasi Sekolah (High School Information)</h3>

        {/* NAMA SEKOLAH — your existing school search, now with tidak ditemukan option */}
        <div className={form.formGroup}>
          <label className={form.label}>Nama Asal Sekolah (Name of High School) *</label>
          <div className={form.selectWrapper}>
            <input
              className={form.input}
              name="asal_sekolah"
              value={query}
              placeholder="Ketik nama sekolah (minimal 1 karakter)..."
              autoComplete="off"
              onFocus={() => setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 150)}
              onChange={(e) => setQuery(e.target.value)}
            />
            {open && query.trim().length > 0 && (
              <div className={form.dropdown}>
                {filtered.map((s, i) => {
                  const isNotFound = s === "Sekolah tidak ditemukan";
                  return (
                    <div
                      key={i}
                      className={`${form.option} ${isNotFound ? form.optionNotFound : ""}`}
                      onMouseDown={() => selectSchool(s)}
                    >
                      {isNotFound ? "⚠ Sekolah tidak ditemukan" : s}
                    </div>
                  );
                })}
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
          <button className={`${form.btn} ${form.btnDanger}`}>Batal</button>
          <button className={`${form.btn} ${form.btnPrimary}`} onClick={handleNext}>
            Selanjutnya
          </button>
        </div>

      </div>
    </div>
  );
}