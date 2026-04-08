import styles from "./Step1.module.scss";
import form from "../../styles/form.module.scss";
import ProgressBar from "../../hooks/ProgressBar";
import useUniversitySearch from "../../hooks/useUniversitySearch";

type Props = {
  formData: any;
  setFormData: (data: any) => void;
  next: () => void;
  goToStep: (n: number) => void;
  currentStep: number;
};

const PRODI_S2_OPTIONS = [
  { value: "52", label: "Magister Hukum (Master of Law)" },
  { value: "44", label: "Magister Manajemen (Master of Management)" },
];

const TAHUN_OPTIONS = Array.from({ length: 16 }, (_, i) => 2011 + i);

export default function Step1S2({
  formData,
  setFormData,
  next,
  goToStep,
  currentStep,
}: Props) {
  const {
    queryUni,
    setQueryUni,
    openUni,
    setOpenUni,
    filteredUni,
    selectUniversity,
  } = useUniversitySearch(setFormData);

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
    const required = ["nik", "nama", "email", "nohp"];
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
              { label: "DOKUMEN", sub: "DOCUMENT" },
              { label: "BIODATA ORANGTUA", sub: "(PARENTAL DATA)" },
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
              value={formData.tanggallahir || ""}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* NPWP */}
        <div className={form.formGroup}>
          <label className={form.label}>No. NPWP (Tax ID Number)</label>
          <input
            className={form.input}
            name="npwp"
            value={formData.npwp || ""}
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

        {/* NO HP */}
        <div className={form.formGroup}>
          <label className={form.label}>No. Telepon (Phone Number) *</label>
          <input
            className={form.input}
            name="nohp"
            value={formData.nohp || ""}
            onChange={handleChange}
          />
        </div>

        {/* AGAMA */}
        <div className={form.formGroup}>
          <label className={form.label}>Agama (Religion) *</label>
          <div className={form.selectWrapper}>
            <select
              className={form.select}
              name="agama"
              value={formData.agama || ""}
              onChange={handleChange}
            >
              <option value="">Agama (Religion) *</option>
              <option value="5">BUDDHA</option>
              <option value="4">HINDU</option>
              <option value="1">ISLAM</option>
              <option value="2">KATHOLIK</option>
              <option value="6">KONGHUCU</option>
              <option value="3">KRISTEN</option>
              <option value="7">TIDAK ADA DATA</option>
            </select>
          </div>
        </div>

        {/* REFERENSI */}
        <div className={form.formGroup}>
          <label className={form.label}>Referensi / Rekomendasi (Reference / Recommendation)</label>
          <input
            className={form.input}
            name="referensi"
            value={formData.referensi || ""}
            onChange={handleChange}
          />
        </div>

        {/* BIDANG KEAHLIAN */}
        <div className={form.formGroup}>
          <label className={form.label}>Bidang Keahlian (Area of Expertise)</label>
          <input
            className={form.input}
            name="keahlian"
            value={formData.keahlian || ""}
            onChange={handleChange}
          />
        </div>

        {/* SUMBER BIAYA STUDI */}
        <div className={form.formGroup}>
          <label className={form.label}>Sumber Biaya Studi (Source of Tuition Funding) *</label>
          <div className={form.selectWrapper}>
            <select
              className={form.select}
              name="sumber_studi"
              value={formData.sumber_studi || ""}
              onChange={handleChange}
            >
              <option value="">Sumber Biaya Studi (Source of Tuition Funding) *</option>
              <option value="sendiri">Sendiri (Self-funding)</option>
              <option value="instansi">Instansi (Institute)</option>
              <option value="lainnya">Lainnya (Others)</option>
            </select>
          </div>
        </div>

        {/* TEMPAT TINGGAL */}
        <h3 className={styles.sectionTitle}>Tempat Tinggal (Residence)</h3>

        <div className={form.formGroup}>
          <label className={form.label}>Alamat Tempat Tinggal (Address) *</label>
          <input
            className={form.input}
            name="alamat"
            value={formData.alamat || ""}
            onChange={handleChange}
          />
        </div>

        <div className={form.row}>
          <div className={form.col}>
            <label className={form.label}>Nama Dusun (Village / City name)</label>
            <input
              className={form.input}
              name="namadusun"
              value={formData.namadusun || ""}
              onChange={handleChange}
            />
          </div>
          <div className={form.col}>
            <label className={form.label}>Kode Post (ZIP Code)</label>
            <input
              className={form.input}
              name="kodepost"
              maxLength={5}
              value={formData.kodepost || ""}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className={form.row}>
          <div className={form.col}>
            <label className={form.label}>No RT</label>
            <input
              className={form.input}
              name="nort"
              value={formData.nort || ""}
              onChange={handleChange}
            />
          </div>
          <div className={form.col}>
            <label className={form.label}>No RW</label>
            <input
              className={form.input}
              name="norw"
              value={formData.norw || ""}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className={form.row}>
          <div className={form.col}>
            <label className={form.label}>Kelurahan (Sub District name) *</label>
            <input
              className={form.input}
              name="kelurahan"
              value={formData.kelurahan || ""}
              onChange={handleChange}
            />
          </div>
          <div className={form.col}>
            <label className={form.label}>Kecamatan (District name) *</label>
            <input
              className={form.input}
              name="kecamatan"
              value={formData.kecamatan || ""}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* ASAL UNIVERSITAS */}
        <h3 className={styles.sectionTitle}>Informasi Asal Universitas (Former University Information)</h3>

        <div className={form.formGroup}>
          <label className={form.label}>Nama Universitas (Name of University)</label>
          <div className={form.selectWrapper}>
            <input
              className={form.input}
              name="universitas"
              value={queryUni}
              placeholder="Masukan nama Universitas (Name Of University)"
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

        <div className={form.formGroup}>
          <label className={form.label}>Jurusan (Major) *</label>
          <input
            className={form.input}
            name="jurusan"
            value={formData.jurusan || ""}
            onChange={handleChange}
          />
        </div>

        <div className={form.formGroup}>
          <label className={form.label}>IPK (GPA) *</label>
          <input
            className={form.input}
            type="number"
            max={4}
            step="0.01"
            name="ipk"
            value={formData.ipk || ""}
            onChange={handleChange}
          />
        </div>

        <div className={form.formGroup}>
          <label className={form.label}>Gelar (Degree) *</label>
          <input
            className={form.input}
            name="gelar"
            value={formData.gelar || ""}
            onChange={handleChange}
          />
        </div>

        {/* INFORMASI PEKERJAAN */}
        <h3 className={styles.sectionTitle}>Informasi Pekerjaan (Job Information)</h3>

        <div className={form.formGroup}>
          <label className={form.label}>Nama Perusahaan (Company name)</label>
          <input
            className={form.input}
            name="perusahaan_nama"
            value={formData.perusahaan_nama || ""}
            onChange={handleChange}
          />
        </div>

        <div className={form.formGroup}>
          <label className={form.label}>Alamat Perusahaan (Company address)</label>
          <input
            className={form.input}
            name="alamat_instansi"
            value={formData.alamat_instansi || ""}
            onChange={handleChange}
          />
        </div>

        <div className={form.formGroup}>
          <label className={form.label}>Jabatan (Position)</label>
          <input
            className={form.input}
            name="jabatan"
            value={formData.jabatan || ""}
            onChange={handleChange}
          />
        </div>

        <div className={form.formGroup}>
          <label className={form.label}>Status Perusahaan (Company Status)</label>
          <div className={form.selectWrapper}>
            <select
              className={form.select}
              name="status_instansi"
              value={formData.status_instansi || ""}
              onChange={handleChange}
            >
              <option value="">Status Perusahaan (Company Status)</option>
              <option value="pemerintah">Pemerintah (Government)</option>
              <option value="swasta">Swasta (Private)</option>
              <option value="bumn">BUMN</option>
              <option value="ptn">PTN</option>
              <option value="pts">PTS</option>
            </select>
          </div>
        </div>

        <div className={form.formGroup}>
          <label className={form.label}>Tahun Mulai Bekerja (Year of starting work)</label>
          <div className={form.selectWrapper}>
            <select
              className={form.select}
              name="tahun_perusahaan"
              value={formData.tahun_perusahaan || ""}
              onChange={handleChange}
            >
              <option value="">Tahun Mulai Bekerja (Year of starting work)</option>
              {TAHUN_OPTIONS.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        {/* INFORMASI PERKULIAHAN */}
        <h3 className={styles.sectionTitle}>Informasi Perkuliahan (Post-graduate Program)</h3>

        <div className={form.formGroup}>
          <label className={form.label}>Program Studi Pilihan (Selected Study Program)</label>
          <div className={form.selectWrapper}>
            <select
              className={form.select}
              name="prodi"
              value={formData.prodi || ""}
              onChange={handleChange}
            >
              <option value="">Program Studi Pilihan (Selected Study Program)</option>
              {PRODI_S2_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* BUTTON */}
        <div className={form.buttonGroup}>
          <button className={`${form.btn} ${form.btnDanger}`}>
            Batal (Cancel)
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
