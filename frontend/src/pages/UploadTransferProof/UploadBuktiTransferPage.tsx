import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import "./UploadBuktiTransferPage.scss";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BiodataPendaftaran {
    nomorDaftar: string;
    periode:     string;
    gelombang:   string;
    jurusan:     string;
    namaLengkap: string;
    alamatEmail: string;
    nomorNIK:    string;
}

interface TambahBuktiTransferForm {
    pemilikRekening: string;
    bank:            string;
    file:            File | null;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Biodata summary — mirrors BuktiTransferPage's BiodataSection style. */
function BiodataSection({ data }: { data: BiodataPendaftaran }) {
    const rows: [string, string][] = [
        ["Nomor Daftar (Registration Number)",                data.nomorDaftar],
        ["Periode (Period)",                                   data.periode],
        ["Gelombang (Group)",                                  data.gelombang],
        ["Jurusan (Study Program)",                            data.jurusan],
        ["Nama Lengkap (Full Name)",                           data.namaLengkap],
        ["Alamat Email (Email)",                               data.alamatEmail],
        ["Nomor NIK (National Identification Number)",         data.nomorNIK],
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

/** Download VA guide banner. */
function DownloadBanner({ href }: { href: string }) {
    return (
        <div className="download-banner">
            <a
                href={href}
                className="download-btn"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Download Panduan Pembayaran dengan VA"
            >
                <span className="download-icon" aria-hidden="true">⬇</span>
                Klik disini untuk Download Panduan Pembayaran dengan VA
            </a>
        </div>
    );
}

/** Reusable labeled text input. */
function FormTextInput({
    id,
    label,
    placeholder,
    value,
    autoComplete,
    onChange,
}: {
    id:            string;
    label:         string;
    placeholder:   string;
    value:         string;
    autoComplete?: string;
    onChange:      (e: ChangeEvent<HTMLInputElement>) => void;
}) {
    return (
        <div className="form-field">
            <label htmlFor={id} className="field-label">
                {label}<span className="required-star" aria-hidden="true"> *</span>
            </label>
            <input
                id={id}
                type="text"
                className="single-input"
                placeholder={`${placeholder}*`}
                value={value}
                autoComplete={autoComplete}
                onChange={onChange}
                required
            />
        </div>
    );
}

/** Custom file picker — hidden native input, custom Browse button. */
function FileInputField({
    id,
    label,
    file,
    onFileChange,
}: {
    id:           string;
    label:        string;
    file:         File | null;
    onFileChange: (file: File | null) => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleBrowseClick = () => inputRef.current?.click();

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        onFileChange(e.target.files?.[0] ?? null);
    };

    return (
        <div className="form-field">
            <label htmlFor={id} className="field-label">
                {label}<span className="required-star" aria-hidden="true"> *</span>
            </label>
            <div className="file-input-row">
                <span
                    className={`file-name-display${file ? " has-file" : ""}`}
                    aria-live="polite"
                >
                    {file ? file.name : "Bukti Transfer *"}
                </span>
                <button
                    type="button"
                    className="browse-btn"
                    onClick={handleBrowseClick}
                    aria-controls={id}
                >
                    Browse
                </button>
                <input
                    ref={inputRef}
                    id={id}
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleChange}
                    aria-label={label}
                />
            </div>
            <span className="uploaded-hint">
                Dokumen Terupload :{file && <strong> {file.name}</strong>}
            </span>
        </div>
    );
}

/** Batal + Upload buttons — uses same .btn convention as BuktiTransferPage. */
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
                    ? <><div className="spinner" aria-hidden="true" /> Upload</>
                    : "Upload"
                }
            </button>
        </div>
    );
}

// ─── Mock data — ganti dengan data dari props / context / API ─────────────────

const MOCK_BIODATA: BiodataPendaftaran = {
    nomorDaftar: "OL2520068",
    periode:     "2025/2026",
    gelombang:   "Beasiswa II",
    jurusan:     "Teknologi Informasi",
    namaLengkap: "karenina",
    alamatEmail: "izayoi",
    nomorNIK:    "2323",
};

const PANDUAN_URL = "https://pendaftaran.uib.ac.id/panduan/pembayaran-va"; // ganti ke URL asli

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UploadBuktiTransferPage() {
    const navigate = useNavigate();

    const [form, setForm] = useState<TambahBuktiTransferForm>({
        pemilikRekening: "",
        bank:            "",
        file:            null,
    });
    const [isLoading, setIsLoading] = useState(false);

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleTextChange =
        (field: keyof Pick<TambahBuktiTransferForm, "pemilikRekening" | "bank">) =>
        (e: ChangeEvent<HTMLInputElement>) =>
            setForm(prev => ({ ...prev, [field]: e.target.value }));

    const handleFileChange = (file: File | null) =>
        setForm(prev => ({ ...prev, file }));

    const handleCancel = () => navigate(-1);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!form.file) return;
        setIsLoading(true);
        try {
            // TODO: ganti dengan real API call, e.g. await uploadBuktiTransfer(form);
            await new Promise(r => setTimeout(r, 1500));
            navigate(-1); // kembali ke BuktiTransferPage setelah berhasil
        } finally {
            setIsLoading(false);
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="page-content">
            <div className="upload-bukti-box">

                {/* ── Biodata ── */}
                <h2 className="section-title">Biodata Pendaftaran</h2>
                <BiodataSection data={MOCK_BIODATA} />

                {/* ── Form upload ── */}
                <h3 className="table-title">
                    Daftar Bukti Transfer (List of Receipt Payment)
                </h3>

                <DownloadBanner href={PANDUAN_URL} />

                <form onSubmit={handleSubmit} noValidate>
                    <div className="field-group">
                        <FormTextInput
                            id="pemilikRekening"
                            label="Pemilik Rekening (Account Owner)"
                            placeholder="Pemilik Rekening"
                            value={form.pemilikRekening}
                            autoComplete="name"
                            onChange={handleTextChange("pemilikRekening")}
                        />
                        <FormTextInput
                            id="bank"
                            label="Bank"
                            placeholder="Bank"
                            value={form.bank}
                            onChange={handleTextChange("bank")}
                        />
                        <FileInputField
                            id="buktiTransfer"
                            label="Bukti Transfer (Proof of Payment)"
                            file={form.file}
                            onFileChange={handleFileChange}
                        />
                    </div>

                    <ActionRow isLoading={isLoading} onCancel={handleCancel} />
                </form>

            </div>
        </div>
    );
}
