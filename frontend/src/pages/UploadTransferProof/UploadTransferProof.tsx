"use client";

import {
    type ChangeEvent,
    type FormEvent,
    useEffect,
    useRef,
    useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { downloadStaticPdf } from "@/utils/downloadPdf";
import { toast } from "sonner";
import { api } from "@/api";
import styles from "./UploadTransferProof.module.scss";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BiodataPendaftaran {
    nomorDaftar: string;
    periode: string;
    gelombang: string;
    jurusan: string;
    namaLengkap: string;
    alamatEmail: string;
    nomorNIK: string;
}

interface TambahBuktiTransferForm {
    pemilikRekening: string;
    bank: string;
    file: File | null;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function BiodataSection({ data }: { data: BiodataPendaftaran }) {
    const rows: [string, string][] = [
        ["Nomor Daftar (Registration Number)", data.nomorDaftar],
        ["Periode (Period)", data.periode],
        ["Gelombang (Group)", data.gelombang],
        ["Jurusan (Study Program)", data.jurusan],
        ["Nama Lengkap (Full Name)", data.namaLengkap],
        ["Alamat Email (Email)", data.alamatEmail],
        ["Nomor NIK (National Identification Number)", data.nomorNIK],
    ];
    return (
        <div className={styles.biodataInfo}>
            {rows.map(([label, value]) => (
                <div key={label} className={styles.infoRow}>
                    <span className={styles.infoLabel}>{label}</span>
                    <span className={styles.infoValue}>: {value || "-"}</span>
                </div>
            ))}
        </div>
    );
}

function FormTextInput({
    id,
    label,
    placeholder,
    value,
    autoComplete,
    onChange,
}: {
    id: string;
    label: string;
    placeholder: string;
    value: string;
    autoComplete?: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
    return (
        <div className={styles.formField}>
            <label htmlFor={id} className={styles.fieldLabel}>
                {label}
                <span className={styles.requiredStar}> *</span>
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

function FileInputField({
    id,
    label,
    file,
    onFileChange,
}: {
    id: string;
    label: string;
    file: File | null;
    onFileChange: (file: File | null) => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    return (
        <div className={styles.formField}>
            <label htmlFor={id} className={styles.fieldLabel}>
                {label}
                <span className={styles.requiredStar}> *</span>
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

function ActionRow({
    isLoading,
    onCancel,
}: {
    isLoading: boolean;
    onCancel: () => void;
}) {
    return (
        <div className={styles.bottomActions}>
            <button
                type="button"
                className={styles.btnDanger}
                onClick={onCancel}
                disabled={isLoading}
            >
                Batal
            </button>
            <button
                type="submit"
                className={styles.btn}
                disabled={isLoading}
                aria-busy={isLoading}
            >
                {isLoading ? (
                    <>
                        <div className={styles.spinner} aria-hidden="true" />{" "}
                        Upload
                    </>
                ) : (
                    "Upload"
                )}
            </button>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UploadBuktiTransferPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const nomorDaftar = searchParams.get("nomorDaftar");

    const [form, setForm] = useState<TambahBuktiTransferForm>({
        pemilikRekening: "",
        bank: "",
        file: null,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isFetchingData, setIsFetchingData] = useState(false);

    const [biodata, setBiodata] = useState<BiodataPendaftaran>({
        nomorDaftar: nomorDaftar || "",
        periode: "",
        gelombang: "",
        jurusan: "",
        namaLengkap: "",
        alamatEmail: "",
        nomorNIK: "",
    });

    useEffect(() => {
        if (!nomorDaftar) return;

        const fetchData = async () => {
            setIsFetchingData(true);
            try {
                const data = await api.profile.getRegistration(nomorDaftar);
                if (data) {
                    setBiodata({
                        nomorDaftar: nomorDaftar,
                        periode: new Date(data.created_at || Date.now())
                            .getFullYear()
                            .toString(),
                        gelombang: data.batchName || "-",
                        jurusan:
                            data.type === "S1"
                                ? data.prodi_pil_name || data.prodi_pil || "-"
                                : data.jurusan || "-",
                        namaLengkap: data.nama || "-",
                        alamatEmail: data.email || "-",
                        nomorNIK: data.nik || "-",
                    });
                }
            } catch (err) {
                console.error("Failed to fetch registration details", err);
                toast.error("Gagal mengambil data pendaftaran.");
            } finally {
                setIsFetchingData(false);
            }
        };

        fetchData();
    }, [nomorDaftar]);

    // ── Download Panduan VA via protected route ───────────────────────────────
    const handleDownloadVA = async () => {
        setIsDownloading(true);
        try {
            await downloadStaticPdf("VA", "VA.pdf");
        } catch (err) {
            toast.error(
                err instanceof Error
                    ? err.message
                    : "Gagal download panduan VA",
            );
        } finally {
            setIsDownloading(false);
        }
    };

    const handleTextChange =
        (
            field: keyof Pick<
                TambahBuktiTransferForm,
                "pemilikRekening" | "bank"
            >,
        ) =>
        (e: ChangeEvent<HTMLInputElement>) =>
            setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!nomorDaftar) {
            toast.error("Nomor daftar tidak ditemukan.");
            return;
        }
        if (!form.file) {
            toast.error("Pilih file bukti transfer terlebih dahulu.");
            return;
        }
        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append("pemilikRekening", form.pemilikRekening);
            formData.append("bank", form.bank);
            formData.append("file", form.file);
            await api.transfer.uploadBukti(nomorDaftar, formData);
            toast.success("Bukti transfer berhasil diupload!");
            router.back();
        } catch (err) {
            toast.error(
                err instanceof Error ? err.message : "Terjadi kesalahan",
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <h2 className={styles.sectionTitle}>Biodata Pendaftaran</h2>
                {isFetchingData ? (
                    <p>Loading biodata...</p>
                ) : (
                    <BiodataSection data={biodata} />
                )}

                <h3 className={styles.tableTitle}>
                    Daftar Bukti Transfer (List of Receipt Payment)
                </h3>

                {/* Download Panduan VA */}
                <div className={styles.downloadBanner}>
                    <button
                        type="button"
                        className={styles.downloadBtn}
                        onClick={handleDownloadVA}
                        disabled={isDownloading}
                        aria-busy={isDownloading}
                    >
                        {isDownloading
                            ? "⏳ Mengunduh..."
                            : "⬇ Klik disini untuk Download Panduan Pembayaran dengan VA"}
                    </button>
                </div>

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
                            onFileChange={(file) =>
                                setForm((prev) => ({ ...prev, file }))
                            }
                        />
                    </div>
                    <ActionRow
                        isLoading={isLoading}
                        onCancel={() => router.back()}
                    />
                </form>
            </div>
        </main>
    );
}
