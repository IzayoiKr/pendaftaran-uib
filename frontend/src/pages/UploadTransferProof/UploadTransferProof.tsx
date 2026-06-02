"use client";

import {
    type ChangeEvent,
    type FormEvent,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { downloadStaticPdf } from "@/utils/downloadPdf";
import { toast } from "sonner";
import { api } from "@/api";
import NIKReveal from "@/components/NIKReveal/NIKReveal";
import styles from "./UploadTransferProof.module.scss";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BiodataPendaftaran {
    nomorDaftar: string;
    periode: string;
    gelombang: string;
    jurusan: string;
    namaLengkap: string;
    alamatEmail: string;
    nomorNIK: string | ReactNode;
}

interface TambahBuktiTransferForm {
    pemilikRekening: string;
    bank: string;
    amount: string;
    paymentDate: string;
    file: File | null;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function BiodataSection({ data }: { data: BiodataPendaftaran }) {
    const rows: [string, string | ReactNode][] = [
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
                <div key={label.toString()} className={styles.infoRow}>
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
    type = "text",
    autoComplete,
    onChange,
}: {
    id: string;
    label: string;
    placeholder: string;
    value: string;
    type?: string;
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
                type={type}
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
    const regID = searchParams.get("regID");

    const [form, setForm] = useState<TambahBuktiTransferForm>({
        pemilikRekening: "",
        bank: "",
        amount: "",
        paymentDate: "",
        file: null,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);

    const [biodata, setBiodata] = useState<BiodataPendaftaran>({
        nomorDaftar: "-",
        periode: "-",
        gelombang: "-",
        jurusan: "-",
        namaLengkap: "-",
        alamatEmail: "-",
        nomorNIK: "-",
    });

    useEffect(() => {
        if (!regID) return;

        const fetchData = async () => {
            setIsFetching(true);
            try {
                const res = await api.profile.getRegistration(regID);
                if (res) {
                    const { registration, user, current_prodi } = res;
                    setBiodata({
                        nomorDaftar: registration.examinee_id || registration.registration_id.slice(0, 8),
                        periode: registration.academic_year || "-",
                        gelombang: registration.batch_name || "-",
                        jurusan: current_prodi || "-",
                        namaLengkap: user.full_name || "-",
                        alamatEmail: user.email || "-",
                        nomorNIK: <NIKReveal masked={user.nik} /> || "-",
                    });
                }
            } catch (err) {
                console.error("Failed to fetch registration details", err);
                toast.error("Gagal mengambil data pendaftaran.");
            } finally {
                setIsFetching(false);
            }
        };

        fetchData();
    }, [regID]);

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
                "pemilikRekening" | "bank" | "amount" | "paymentDate"
            >,
        ) =>
        (e: ChangeEvent<HTMLInputElement>) =>
            setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!form.file) {
            toast.error("Pilih file bukti transfer terlebih dahulu.");
            return;
        }
        if (!regID) {
            toast.error("Registration ID tidak ditemukan.");
            return;
        }
        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append("registrationID", regID);
            formData.append("accountHolder", form.pemilikRekening);
            formData.append("bankName", form.bank);
            formData.append("amount", form.amount);
            formData.append("paymentDate", form.paymentDate);
            formData.append("file", form.file);

            await api.transferProof.upload(formData);
            toast.success("Bukti transfer berhasil diupload!");
            router.replace(`/account/transfer-proof?regID=${regID}`);
        } catch (err) {
            toast.error(
                err instanceof Error ? err.message : "Terjadi kesalahan",
            );
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) return <p>Loading...</p>;

    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <h2 className={styles.sectionTitle}>Biodata Pendaftaran</h2>
                <BiodataSection data={biodata} />

                <h3 className={styles.tableTitle}>
                    Tambah Bukti Transfer (Add Receipt Payment)
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
                        <FormTextInput
                            id="amount"
                            label="Nominal (Amount)"
                            placeholder="Nominal"
                            type="number"
                            value={form.amount}
                            onChange={handleTextChange("amount")}
                        />
                        <FormTextInput
                            id="paymentDate"
                            label="Tanggal Pembayaran (Payment Date)"
                            placeholder="Tanggal Pembayaran"
                            type="date"
                            value={form.paymentDate}
                            onChange={handleTextChange("paymentDate")}
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
