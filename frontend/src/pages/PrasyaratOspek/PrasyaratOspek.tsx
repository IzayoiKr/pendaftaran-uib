"use client";

import { type ChangeEvent, useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { downloadStaticPdf, viewProtectedPdf } from "@/utils/downloadPdf";
import { toast } from "sonner";
import { api } from "@/api";
import NIKReveal from "@/components/NIKReveal/NIKReveal";
import styles from "./PrasyaratOspek.module.scss";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BiodataPendaftaran {
    periode: string;
    gelombang: string;
    jurusan: string;
    namaLengkap: string;
    alamatEmail: string;
    nomorNIK: string | ReactNode;
}

interface UploadField {
    name: string;
    label: string;
    uploadedUrl?: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function BiodataSection({ data }: { data: BiodataPendaftaran }) {
    const rows: [string, string | ReactNode][] = [
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

function FileUploadRow({
    field,
    file,
    regID,
    uploadedFileName,
    onChange,
    onDownloadContoh,
    isDownloading,
}: {
    field: UploadField;
    file: File | null;
    regID: string | null;
    uploadedFileName?: string;
    onChange: (name: string, file: File | null) => void;
    onDownloadContoh?: () => void;
    isDownloading?: boolean;
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
                    hide-id="true"
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        onChange(field.name, e.target.files?.[0] ?? null)
                    }
                />
            </div>

            <div className={styles.uploadLinks}>
                {onDownloadContoh && (
                    <p>
                        Contoh {field.label} :{" "}
                        <button
                            type="button"
                            className={styles.linkBtn}
                            onClick={onDownloadContoh}
                            disabled={isDownloading}
                        >
                            {isDownloading
                                ? "Mengunduh..."
                                : "Klik Untuk Download"}
                        </button>
                    </p>
                )}
                {uploadedFileName && (
                    <p>
                        {field.label} Terupload :{" "}
                        <button
                            type="button"
                            onClick={() => viewProtectedPdf(`/api/ospek/prasyarat/file/${regID}/${field.name.toLowerCase()}`, uploadedFileName)}
                            className={styles.buktiLink}
                        >
                            <strong>{uploadedFileName}</strong>
                        </button>
                    </p>
                )}
            </div>
        </div>
    );
}

// ─── Field config ─────────────────────────────────────────────────────────────

const UPLOAD_FIELDS: UploadField[] = [
    { name: "pasFoto", label: "Pas Photo Final (Untuk KTM)" },
    { name: "ijazah", label: "Ijazah" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PrasyaratOspek() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const regID = searchParams.get("regID");

    const [isLoading, setIsLoading] = useState(false);
    const [isDownloadingContoh, setIsDownloadingContoh] = useState(false);
    const [isFetchingData, setIsFetchingData] = useState(false);
    const [files, setFiles] = useState<Record<string, File | null>>(
        Object.fromEntries(UPLOAD_FIELDS.map((f) => [f.name, null])),
    );

    const [biodata, setBiodata] = useState<BiodataPendaftaran>({
        periode: "-",
        gelombang: "-",
        jurusan: "-",
        namaLengkap: "-",
        alamatEmail: "-",
        nomorNIK: "-",
    });

    const [status, setStatus] = useState("Menunggu Status (Pending)");
    const [catatanPemeriksaan, setCatatanPemeriksaan] = useState("");
    const [currentFiles, setCurrentFiles] = useState<{
        pasFoto?: string;
        ijazah?: string;
    }>({});

    useEffect(() => {
        if (!regID) return;

        const fetchData = async () => {
            setIsFetchingData(true);
            try {
                const data: any = await api.ospek.getPrasyarat(regID);
                if (data) {
                    setBiodata({
                        periode: data.academic_year || "-",
                        gelombang: data.batch_name || "-",
                        jurusan: data.study_program || "-",
                        namaLengkap: data.full_name || "-",
                        alamatEmail: data.email || "-",
                        nomorNIK: <NIKReveal masked={data.nik} /> || "-",
                    });

                    setStatus(data.status || "Menunggu Status (Pending)");
                    setCatatanPemeriksaan(data.notes || "");
                    setCurrentFiles({
                        pasFoto: data.pas_foto_name,
                        ijazah: data.ijazah_name,
                    });
                }
            } catch (err: any) {
                if (err?.status !== 404) {
                    console.error("Failed to fetch ospek prerequisites", err);
                    toast.error("Gagal mengambil data prasyarat OSPEK.");
                }
            } finally {
                setIsFetchingData(false);
            }
        };

        fetchData();
    }, [regID]);

    const handleFileChange = (name: string, file: File | null) =>
        setFiles((prev) => ({ ...prev, [name]: file }));

    const handleDownloadContohPasPhoto = async () => {
        setIsDownloadingContoh(true);
        try {
            await downloadStaticPdf("contoh_pasphoto", "contoh_pasphoto.pdf");
        } catch (err) {
            toast.error(
                err instanceof Error
                    ? err.message
                    : "Gagal download contoh pas photo",
            );
        } finally {
            setIsDownloadingContoh(false);
        }
    };

    const handleUpload = async () => {
        if (!regID) {
            toast.error("Registration ID tidak ditemukan.");
            return;
        }
        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append("registrationID", regID);
            let hasFiles = false;
            UPLOAD_FIELDS.forEach((f) => {
                if (files[f.name]) {
                    formData.append(f.name, files[f.name] as File);
                    hasFiles = true;
                }
            });

            if (!hasFiles) {
                toast.error("Pilih minimal satu file untuk diupload.");
                return;
            }

            await api.ospek.uploadPrasyarat(formData);
            toast.success("Upload berhasil!");
            // Refresh names
            const data: any = await api.ospek.getPrasyarat(regID);
            if (data) {
                setCurrentFiles({
                    pasFoto: data.pas_foto_name,
                    ijazah: data.ijazah_name,
                });
                setStatus(data.status);
            }
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
                <h1 className={styles.pageTitle}>
                    Prasyarat OSPEK (OSPEK Prerequisites)
                </h1>

                <h2 className={styles.sectionTitle}>
                    Biodata Pendaftaran (Registration Data)
                </h2>
                {isFetchingData ? (
                    <p>Loading...</p>
                ) : (
                    <BiodataSection data={biodata} />
                )}

                <div className={styles.statusSection}>
                    <p className={styles.statusHeading}>
                        Status Prasyarat OSPEK (Prerequisite Status)
                    </p>
                    <p className={styles.statusRow}>
                        Status Prasyarat OSPEK :{" "}
                        <span className={styles.statusValue}>{status}</span>
                    </p>
                    <p className={styles.statusRow}>
                        Catatan Pemeriksaan (Review Notes) :{" "}
                        {catatanPemeriksaan || "-"}
                    </p>
                </div>

                {UPLOAD_FIELDS.map((field) => (
                    <FileUploadRow
                        key={field.name}
                        field={field}
                        file={files[field.name]}
                        regID={regID}
                        uploadedFileName={(currentFiles as any)[field.name]}
                        onChange={handleFileChange}
                        onDownloadContoh={
                            field.name === "pasFoto"
                                ? handleDownloadContohPasPhoto
                                : undefined
                        }
                        isDownloading={
                            field.name === "pasFoto"
                                ? isDownloadingContoh
                                : false
                        }
                    />
                ))}

                <div className={styles.bottomActions}>
                    <button
                        className={styles.btnDanger}
                        onClick={() => router.back()}
                    >
                        Kembali (Back)
                    </button>
                    <button
                        className={styles.btn}
                        onClick={handleUpload}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <div
                                    className={styles.spinner}
                                    aria-hidden="true"
                                />{" "}
                                Uploading...
                            </>
                        ) : (
                            "Upload"
                        )}
                    </button>
                </div>
            </div>
        </main>
    );
}
