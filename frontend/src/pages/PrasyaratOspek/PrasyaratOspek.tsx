'use client';

import { useRef, useState, useEffect, type ChangeEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/api";
import { downloadStaticPdf } from "@/utils/downloadPdf";
import styles from "./PrasyaratOspek.module.scss";

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

interface UploadField {
    name:         string;
    label:        string;
    uploadedUrl?: string;
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
                    <span className={styles.infoValue}>: {value || "-"}</span>
                </div>
            ))}
        </div>
    );
}

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
                    ref={inputRef} hide-id="true" type="file" accept=".jpg,.jpeg,.png,.pdf"
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
    const searchParams = useSearchParams();
    const nomorDaftar = searchParams.get("nomorDaftar");

    const [isLoading, setIsLoading]                 = useState(false);
    const [isDownloadingContoh, setIsDownloadingContoh] = useState(false);
    const [isFetchingData, setIsFetchingData] = useState(false);
    const [files, setFiles] = useState<Record<string, File | null>>(
        Object.fromEntries(UPLOAD_FIELDS.map(f => [f.name, null]))
    );

    const [biodata, setBiodata] = useState<BiodataPendaftaran>({
        nomorDaftar: nomorDaftar || "",
        periode: "",
        gelombang: "",
        jurusan: "",
        namaLengkap: "",
        alamatEmail: "",
        nomorNIK: "",
    });

    const [status, setStatus] = useState("Menunggu Status (Pending)");
    const [catatanPemeriksaan, setCatatanPemeriksaan] = useState("");

    useEffect(() => {
        if (!nomorDaftar) return;

        const fetchData = async () => {
            setIsFetchingData(true);
            try {
                const data = await api.profile.getRegistration(nomorDaftar);
                if (data) {
                    setBiodata({
                        nomorDaftar: nomorDaftar,
                        periode: new Date(data.created_at || Date.now()).getFullYear().toString(),
                        gelombang: data.batchName || "-",
                        jurusan: data.type === "S1" ? (data.prodi_pil_name || data.prodi_pil || "-") : (data.jurusan || "-"),
                        namaLengkap: data.nama || "-",
                        alamatEmail: data.email || "-",
                        nomorNIK: data.nik || "-",
                    });
                    
                    // Update status if available in data
                    if (data.doc_check_status) {
                        setStatus(data.doc_check_status);
                    }
                    if (data.doc_check_notes) {
                        setCatatanPemeriksaan(data.doc_check_notes);
                    }
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

    const handleFileChange = (name: string, file: File | null) =>
        setFiles(prev => ({ ...prev, [name]: file }));

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
            // Fallback for missing api.ospek
            if ((api as any).ospek?.uploadPrasyarat) {
                await (api as any).ospek.uploadPrasyarat(formData);
                toast.success("Upload berhasil!");
            } else {
                // Temporary mock or direct axios call if needed
                toast.error("Endpoint upload belum tersedia. (Upload endpoint not available yet.)");
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <h1 className={styles.pageTitle}>Prasyarat OSPEK (OSPEK Prerequisites)</h1>

                <h2 className={styles.sectionTitle}>Biodata Pendaftaran (Registration Data)</h2>
                {isFetchingData ? <p>Loading...</p> : <BiodataSection data={biodata} />}

                <div className={styles.statusSection}>
                    <p className={styles.statusHeading}>Status Prasyarat OSPEK (Prerequisite Status)</p>
                    <p className={styles.statusRow}>
                        Status Prasyarat OSPEK :{" "}
                        <span className={styles.statusValue}>{status}</span>
                    </p>
                    <p className={styles.statusRow}>
                        Catatan Pemeriksaan (Review Notes) : {catatanPemeriksaan || "-"}
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
                        Kembali (Back)
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
