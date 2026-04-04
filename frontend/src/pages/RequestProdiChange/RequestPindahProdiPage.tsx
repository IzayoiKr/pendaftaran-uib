import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import "./RequestPindahProdiPage.scss";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BiodataPendaftaran {
    nomorDaftar:  string;
    periode:      string;
    gelombang:    string;
    jurusan:      string;          // dipakai juga sebagai prodiSebelumnya
    namaLengkap:  string;
    alamatEmail:  string;
    nomorNIK:     string;
}

interface RequestPindahForm {
    prodiTujuan:          string;
    waktuKuliahSebelumnya: string;
    waktuKuliahBaru:      string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PRODI_OPTIONS = [
    "Akuntansi (Accounting)",
    "Arsitektur (Architecture)",
    "Biologi (Biology)",
    "Gizi (Nutrition)",
    "Ilmu Hukum (Law Science)",
    "Kedokteran (Medicine)",
    "Manajemen (Management)",
    "Pariwisata (Tourism)",
    "Pendidikan Bahasa Inggris (English Language Education)",
    "Profesi Kedokteran (Medicine)",
    "Sistem Informasi (Information System)",
    "Teknik Sipil (Civil Engineering)",
    "Teknologi Informasi (Information Technology)",
] as const;

const WAKTU_KULIAH_OPTIONS = [
    { value: "pagi",  label: "Pagi (Morning Class)" },
    { value: "malam", label: "Malam (Night Class)"  },
] as const;

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Biodata summary — sama persis dengan PerubahanProdiPage. */
function BiodataSection({ data }: { data: BiodataPendaftaran }) {
    const rows: [string, string][] = [
        ["Nomor Daftar",  data.nomorDaftar],
        ["Periode",       data.periode],
        ["Gelombang",     data.gelombang],
        ["Jurusan",       data.jurusan],
        ["Nama Lengkap",  data.namaLengkap],
        ["Alamat Email",  data.alamatEmail],
        ["Nomor NIK",     data.nomorNIK],
    ];

    return (
        <div className="biodata-info">
            {rows.map(([label, value]) => (
                <div key={label} className="info-row">
                    <span className="info-label">{label}</span>
                    <span className="info-value">: {value}</span>
                </div>
            ))}
        </div>
    );
}

/**
 * Read-only select — menampilkan nilai prodi/waktu kuliah sebelumnya.
 * Tidak bisa di-edit oleh user.
 */
function ReadonlySelect({ label, value }: { label: string; value: string }) {
    return (
        <div className="form-field">
            <label className="field-label">{label}</label>
            <select className="select-readonly" disabled tabIndex={-1} aria-readonly="true">
                <option>{value}</option>
            </select>
        </div>
    );
}

/** Editable select — untuk memilih prodi tujuan atau waktu kuliah baru. */
function EditableSelect({
    id,
    label,
    value,
    required,
    onChange,
    children,
}: {
    id:       string;
    label:    string;
    value:    string;
    required?: boolean;
    onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
    children: React.ReactNode;
}) {
    return (
        <div className="form-field">
            <label htmlFor={id} className="field-label">
                {label}
                {required && <span className="required-star" aria-hidden="true"> *</span>}
            </label>
            <select
                id={id}
                className="single-select"
                value={value}
                onChange={onChange}
                required={required}
            >
                {children}
            </select>
        </div>
    );
}

/** Batal + Simpan action buttons. */
function ActionRow({
    isLoading,
    onCancel,
}: {
    isLoading: boolean;
    onCancel:  () => void;
}) {
    return (
        <div className="bottom-actions">
            <button
                type="button"
                className="btn btn-danger"
                onClick={onCancel}
                disabled={isLoading}
            >
                Batal
            </button>
            <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
                aria-busy={isLoading}
            >
                {isLoading
                    ? <><div className="spinner" aria-hidden="true" /> Simpan</>
                    : "Simpan"
                }
            </button>
        </div>
    );
}

// ─── Mock data — ganti dengan data dari props / context / API ─────────────────

const MOCK_BIODATA: BiodataPendaftaran = {
    nomorDaftar:  "OL2520068",
    periode:      "2025/2026",
    gelombang:    "Beasiswa II",
    jurusan:      "Teknologi Informasi",
    namaLengkap:  "Jonatan",
    alamatEmail:  "adsasd",
    nomorNIK:     "test",
};

// Waktu kuliah sebelumnya — seharusnya dari data pendaftaran user
const WAKTU_KULIAH_SEBELUMNYA = "Malam (Night Class)";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RequestPindahProdiPage() {
    const navigate = useNavigate();

    const [form, setForm] = useState<RequestPindahForm>({
        prodiTujuan:           "",
        waktuKuliahSebelumnya: WAKTU_KULIAH_SEBELUMNYA,
        waktuKuliahBaru:       "",
    });
    const [isLoading, setIsLoading] = useState(false);

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleSelectChange =
        (field: keyof RequestPindahForm) =>
        (e: ChangeEvent<HTMLSelectElement>) =>
            setForm(prev => ({ ...prev, [field]: e.target.value }));

    const handleCancel = () => navigate(-1);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // TODO: ganti dengan real API call, e.g. await submitRequestPindahProdi(form);
            await new Promise(r => setTimeout(r, 1500));
            navigate(-1); // kembali ke PerubahanProdiPage setelah berhasil
        } finally {
            setIsLoading(false);
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="page-content">
            <div className="request-prodi-box">

                {/* ── Biodata ── */}
                <h2 className="section-title">Biodata Pendaftaran</h2>
                <BiodataSection data={MOCK_BIODATA} />

                {/* ── Form ── */}
                <h3 className="form-title">Form Request Pindah Program Studi</h3>

                <form onSubmit={handleSubmit} noValidate>
                    <div className="form-grid">

                        {/* Kiri atas — read-only */}
                        <ReadonlySelect
                            label="Program Studi Sebelumnya (Previous Major)"
                            value={`${MOCK_BIODATA.jurusan} (Information Technology)`}
                        />

                        {/* Kanan atas — editable */}
                        <EditableSelect
                            id="prodiTujuan"
                            label="Program Studi Baru (New Major)"
                            value={form.prodiTujuan}
                            required
                            onChange={handleSelectChange("prodiTujuan")}
                        >
                            <option value="" disabled>
                                Program Studi Pilihan (Selected Study Program) *
                            </option>
                            {PRODI_OPTIONS.map(prodi => (
                                <option key={prodi} value={prodi}>{prodi}</option>
                            ))}
                        </EditableSelect>

                        {/* Kiri bawah — read-only */}
                        <ReadonlySelect
                            label="Waktu Kuliah Sebelumnya (Previous Shift) *"
                            value={WAKTU_KULIAH_SEBELUMNYA}
                        />

                        {/* Kanan bawah — editable */}
                        <EditableSelect
                            id="waktuKuliahBaru"
                            label="Waktu Kuliah Baru (New Shift)"
                            value={form.waktuKuliahBaru}
                            required
                            onChange={handleSelectChange("waktuKuliahBaru")}
                        >
                            <option value="" disabled>
                                Pilih Waktu Kuliah *
                            </option>
                            {WAKTU_KULIAH_OPTIONS.map(({ value, label }) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </EditableSelect>

                    </div>

                    <ActionRow isLoading={isLoading} onCancel={handleCancel} />
                </form>

            </div>
        </div>
    );
}
