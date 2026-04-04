import { useRef, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import "./PrasyaratOspekPage.scss";

// ── Types ──────────────────────────────────────────────────────────────────────
interface UploadField {
    name:          string;
    label:         string;
    contohUrl?:    string;   // link download contoh
    uploadedUrl?:  string;   // link file yang sudah terupload (dari backend)
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function FileUploadRow({
    field,
    file,
    onChange,
}: {
    field:    UploadField;
    file:     File | null;
    onChange: (name: string, file: File | null) => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleBrowse = () => inputRef.current?.click();

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        onChange(field.name, e.target.files?.[0] ?? null);
    };

    return (
        <div className="upload-group">
            <div className="file-input-wrapper">
                <span className="file-label">
                    {file ? file.name : field.label}
                </span>
                <button type="button" className="browse-btn" onClick={handleBrowse}>
                    Browse
                </button>
                <input
                    ref={inputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileChange}
                />
            </div>
            <div className="upload-links">
                {field.contohUrl && (
                    <p>
                        Contoh {field.label} :{" "}
                        <a href={field.contohUrl} target="_blank" rel="noopener noreferrer">
                            Klik Untuk Download
                        </a>
                    </p>
                )}
                {field.uploadedUrl && (
                    <p>
                        {field.label} Terupload :{" "}
                        <a href={field.uploadedUrl} target="_blank" rel="noopener noreferrer">
                            Klik Untuk Download (Download)
                        </a>
                    </p>
                )}
            </div>
        </div>
    );
}

// ── Upload fields config — driven by data ──────────────────────────────────────
// TODO: uploadedUrl diisi dari response backend
const UPLOAD_FIELDS: UploadField[] = [
    {
        name:         "pasFoto",
        label:        "Pas Photo Final (Untuk KTM)",
        contohUrl:    "/files/contoh-pas-foto.jpg",   // TODO: URL dari backend
        uploadedUrl:  undefined,                       // TODO: URL dari backend
    },
    {
        name:         "ijazah",
        label:        "Ijazah",
        contohUrl:    undefined,
        uploadedUrl:  undefined,                       // TODO: URL dari backend
    },
];

// ── Parent component ───────────────────────────────────────────────────────────
export default function PrasyaratOspekPage() {
    const navigate  = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    // State per file field
    const [files, setFiles] = useState<Record<string, File | null>>(
        Object.fromEntries(UPLOAD_FIELDS.map(f => [f.name, null]))
    );

    // TODO: ambil dari backend / props / context
    const status           = "Masih dalam pemeriksaan";
    const catatanPemeriksaan = "";

    const handleFileChange = (name: string, file: File | null) => {
        setFiles(prev => ({ ...prev, [name]: file }));
    };

    const handleUpload = async () => {
        setIsLoading(true);
        try {
            // TODO: kirim files ke backend via FormData
            const formData = new FormData();
            UPLOAD_FIELDS.forEach(f => {
                if (files[f.name]) formData.append(f.name, files[f.name] as File);
            });
            await new Promise(r => setTimeout(r, 1000)); // TODO: ganti API call
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="page-content">
            <div className="ospek-box">
                <h3 className="ospek-title">Prasyarat OSPEK</h3>

                <div className="status-section">
                    <p className="status-heading">Status Prasyarat OSPEK</p>
                    <p className="status-row">
                        Status Prasyarat OSPEK :{" "}
                        <span className="status-value">{status}</span>
                    </p>
                    <p className="status-row">
                        Catatan Pemeriksaan Prasyarat OSPEK : {catatanPemeriksaan}
                    </p>
                </div>

                {UPLOAD_FIELDS.map(field => (
                    <FileUploadRow
                        key={field.name}
                        field={field}
                        file={files[field.name]}
                        onChange={handleFileChange}
                    />
                ))}

                <div className="bottom-actions">
                    <button className="btn btn-danger" onClick={() => navigate(-1)}>
                        Kembali
                    </button>
                    <button className="btn btn-primary" onClick={handleUpload} disabled={isLoading}>
                        {isLoading ? "Uploading..." : "Upload"}
                    </button>
                </div>
            </div>
        </div>
    );
}
