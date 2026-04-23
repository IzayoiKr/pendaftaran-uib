'use client';

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/api";
import styles from "./UploadBuktiTransferPage.module.scss";

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
        <div className={styles.biodataInfo}>
            {rows.map(([label, value]) => (
                <div key={label} className={styles.infoRow}>
                    <span className={styles.infoLabel}>{label}</span>
                    <span className={styles.infoValue}>: {value}</span>
                </div>
            ))}
        </div>
    );
}

function DownloadBanner({ href }: { href: string }) {
    return (
        <div className={styles.downloadBanner}>
            <a href={href} className={styles.downloadBtn} target="_blank" rel="noopener noreferrer">
                ⬇ Klik disini untuk Download Panduan Pembayaran dengan VA
            </a>
        </div>
    );
}

function FormTextInput({ id, label, placeholder, value, autoComplete, onChange }: {
    id:            string;
    label:         string;
    placeholder:   string;
    value:         string;
    autoComplete?: string;
    onChange:      (e: ChangeEvent<HTMLInputElement>) => void;
}) {
    return (
        <div className={styles.formField}>
            <label htmlFor={id} className={styles.fieldLabel}>
                {label}<span className={styles.requiredStar}> *</span>
            </label>
            <input
                id={id}
                type="text"
                placeholder={`${placeholder}*`}
                value={value}
                autoComplete={autoComplete}
                onChange={onChange}
                required
            />
        </div>
    );
}

function FileInputField({ id, label, file, onFileChange }: {
    id:           string;
    label:        string;
    file:         File | null;
    onFileChange: (file: File | null) => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div className={styles.formField}>
            <label htmlFor={id} className={styles.fieldLabel}>
                {label}<span className={styles.requiredStar}> *</span>
            </label>
            <div className={styles.fileInputRow}>
                <span
                    className={`${styles.fileNameDisplay}${file ? ` ${styles.hasFile}` : ""}`}
                    aria-live="polite"
                >
                    {file ? file.name : "Bukti Transfer *"}
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
                    id={id}
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
                />
            </div>
            <span className={styles.uploadedHint}>
                Dokumen Terupload :{file && <strong> {file.name}</strong>}
            </span>
        </div>
    );
}

function ActionRow({ isLoading, onCancel }: { isLoading: boolean; onCancel: () => void }) {
    return (
        <div className={styles.bottomActions}>
            <button type="button" className={styles.btnDanger} onClick={onCancel} disabled={isLoading}>
                Batal
            </button>
            <button type="submit" className={styles.btn} disabled={isLoading} aria-busy={isLoading}>
                {isLoading
                    ? <><div className={styles.spinner} aria-hidden="true" /> Upload</>
                    : "Upload"
                }
            </button>
        </div>
    );
}

// ─── Mock data — ganti dengan data dari backend / props / context ─────────────

const MOCK_BIODATA: BiodataPendaftaran = {
    nomorDaftar: "-",
    periode:     "-",
    gelombang:   "-",
    jurusan:     "-",
    namaLengkap: "-",
    alamatEmail: "-",
    nomorNIK:    "-",
};

const PANDUAN_URL = "https://pendaftaran.uib.ac.id/panduan/pembayaran-va"; // ganti ke URL asli

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UploadBuktiTransferPage() {
    const router = useRouter();
    const [form, setForm] = useState<TambahBuktiTransferForm>({
        pemilikRekening: "",
        bank:            "",
        file:            null,
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleTextChange =
        (field: keyof Pick<TambahBuktiTransferForm, "pemilikRekening" | "bank">) =>
        (e: ChangeEvent<HTMLInputElement>) =>
            setForm(prev => ({ ...prev, [field]: e.target.value }));

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!form.file) return;
        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append("pemilikRekening", form.pemilikRekening);
            formData.append("bank", form.bank);
            formData.append("file", form.file);
            await api.transfer.uploadBukti(formData); // TODO: pastikan endpoint ini ada
            toast.success("Bukti transfer berhasil diupload!");
            router.back();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <h2 className={styles.sectionTitle}>Biodata Pendaftaran</h2>
                <BiodataSection data={MOCK_BIODATA} />

                <h3 className={styles.tableTitle}>
                    Daftar Bukti Transfer (List of Receipt Payment)
                </h3>
                <DownloadBanner href={PANDUAN_URL} />

                <form onSubmit={handleSubmit} noValidate>
                    <div className={styles.fieldGroup}>
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
                            onFileChange={(file) => setForm(prev => ({ ...prev, file }))}
                        />
                    </div>

                    <ActionRow isLoading={isLoading} onCancel={() => router.back()} />
                </form>
            </div>
        </main>
    );
}
