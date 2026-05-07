'use client';

import { useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/api";
import { downloadStaticPdf } from "@/utils/downloadPdf";
import styles from "./PrasyaratOspek.module.scss";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UploadField {
    name:         string;
    label:        string;
    uploadedUrl?: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FileUploadRow({ field, file, onChange, onDownloadContoh, isDownloading }: {
    field:             UploadField;
    file:              File | null;
    onChange:          (name: string, file: File | null) => void;
    onDownloadContoh?: () => void;
    isDownloading?:    boolean;
}) {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div className={styles.uploadGroup}>
            <div className={styles.fileInputWrapper}>
                <span className={styles.fileLabel}>{file ? file.name : field.label}</span>
                <button type="button" className={styles.browseBtn}
                    onClick={() => inputRef.current?.click()}>
                    Browse
                </button>
                <input
                    ref={inputRef} type="file" accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        onChange(field.name, e.target.files?.[0] ?? null)
                    }
                />
            </div>

            <div className={styles.uploadLinks}>
                {/* Download contoh via protected Route Handler */}
                {onDownloadContoh && (
                    <p>
                        Contoh {field.label} :{" "}
                        <button
                            type="button"
                            className={styles.linkBtn}
                            onClick={onDownloadContoh}
                            disabled={isDownloading}
                        >
                            {isDownloading ? "Mengunduh..." : "Klik Untuk Download"}
                        </button>
                    </p>
                )}
                {field.uploadedUrl && (
                    <p>
                        {field.label} Terupload :{" "}
                        <a href={field.uploadedUrl} target="_blank" rel="noopener noreferrer">
                            Klik Untuk Download
                        </a>
                    </p>
                )}
            </div>
        </div>
    );
}

// ─── Field config ─────────────────────────────────────────────────────────────

const UPLOAD_FIELDS: UploadField[] = [
    { name: "pasFoto", label: "Pas Photo Final (Untuk KTM)" },
    { name: "ijazah",  label: "Ijazah" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PrasyaratOspek() {
    const router = useRouter();

    const [isLoading, setIsLoading]                 = useState(false);
    const [isDownloadingContoh, setIsDownloadingContoh] = useState(false);
    const [files, setFiles] = useState<Record<string, File | null>>(
        Object.fromEntries(UPLOAD_FIELDS.map(f => [f.name, null]))
    );

    // TODO: fetch dari backend berdasarkan nomorDaftar di URL
    const status             = "Menunggu Status";
    const catatanPemeriksaan = "";

    const handleFileChange = (name: string, file: File | null) =>
        setFiles(prev => ({ ...prev, [name]: file }));

    // ── Download contoh pas photo via protected route ─────────────────────────
    const handleDownloadContohPasPhoto = async () => {
        setIsDownloadingContoh(true);
        try {
            await downloadStaticPdf("contoh_pasphoto", "contoh_pasphoto.pdf");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Gagal download contoh pas photo");
        } finally {
            setIsDownloadingContoh(false);
        }
    };

    const handleUpload = async () => {
        setIsLoading(true);
        try {
            const formData = new FormData();
            UPLOAD_FIELDS.forEach(f => {
                if (files[f.name]) formData.append(f.name, files[f.name] as File);
            });
            await api.ospek.uploadPrasyarat(formData);
            toast.success("Upload berhasil!");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <h1 className={styles.pageTitle}>Prasyarat OSPEK</h1>

                <div className={styles.statusSection}>
                    <p className={styles.statusHeading}>Status Prasyarat OSPEK</p>
                    <p className={styles.statusRow}>
                        Status Prasyarat OSPEK :{" "}
                        <span className={styles.statusValue}>{status}</span>
                    </p>
                    <p className={styles.statusRow}>
                        Catatan Pemeriksaan Prasyarat OSPEK : {catatanPemeriksaan}
                    </p>
                </div>

                {UPLOAD_FIELDS.map(field => (
                    <FileUploadRow
                        key={field.name}
                        field={field}
                        file={files[field.name]}
                        onChange={handleFileChange}
                        onDownloadContoh={
                            field.name === "pasFoto" ? handleDownloadContohPasPhoto : undefined
                        }
                        isDownloading={
                            field.name === "pasFoto" ? isDownloadingContoh : false
                        }
                    />
                ))}

                <div className={styles.bottomActions}>
                    <button className={styles.btnDanger} onClick={() => router.back()}>
                        Kembali
                    </button>
                    <button className={styles.btn} onClick={handleUpload} disabled={isLoading}>
                        {isLoading
                            ? <><div className={styles.spinner} aria-hidden="true" /> Uploading...</>
                            : "Upload"
                        }
                    </button>
                </div>
            </div>
        </main>
    );
}