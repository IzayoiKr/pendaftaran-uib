'use client';

import { useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/api";
import styles from "./PrasyaratOspekPage.module.scss";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UploadField {
    name:        string;
    label:       string;
    contohUrl?:  string;
    uploadedUrl?: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FileUploadRow({ field, file, onChange }: {
    field:    UploadField;
    file:     File | null;
    onChange: (name: string, file: File | null) => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div className={styles.uploadGroup}>
            <div className={styles.fileInputWrapper}>
                <span className={styles.fileLabel}>
                    {file ? file.name : field.label}
                </span>
                <button
                    type="button"
                    className={styles.browseBtn}
                    onClick={() => inputRef.current?.click()}
                >
                    Browse
                </button>
                <input
                    ref={inputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        onChange(field.name, e.target.files?.[0] ?? null)
                    }
                />
            </div>
            <div className={styles.uploadLinks}>
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

// ─── Field config ─────────────────────────────────────────────────────────────

const UPLOAD_FIELDS: UploadField[] = [
    { name: "pasFoto", label: "Pas Photo Final (Untuk KTM)", contohUrl: "/files/contoh-pas-foto.jpg" },
    { name: "ijazah",  label: "Ijazah" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PrasyaratOspekPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [files, setFiles] = useState<Record<string, File | null>>(
        Object.fromEntries(UPLOAD_FIELDS.map(f => [f.name, null]))
    );

    // TODO: ambil dari backend / props / context
    const status = "Masih dalam pemeriksaan";
    const catatanPemeriksaan = "";

    const handleFileChange = (name: string, file: File | null) =>
        setFiles(prev => ({ ...prev, [name]: file }));

    const handleUpload = async () => {
        setIsLoading(true);
        try {
            const formData = new FormData();
            UPLOAD_FIELDS.forEach(f => {
                if (files[f.name]) formData.append(f.name, files[f.name] as File);
            });
            await api.ospek.uploadPrasyarat(formData); // TODO: pastikan endpoint ini ada
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
