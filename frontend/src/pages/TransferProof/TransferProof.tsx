"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { api, ApiError } from "@/api";
import { viewProtectedPdf } from "@/utils/downloadPdf";
import NIKReveal from "@/components/NIKReveal/NIKReveal";
import styles from "./TransferProof.module.scss";

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

interface BuktiTransferRow {
    tanggalUpload: string;
    pemilikRekening: string;
    bank: string;
    buktiTransferUrl: string;
    statusValidasi: string;
    tanggalValidasi: string;
    ropUrl: string;
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

const TABLE_HEADERS = [
    "Tanggal Upload (Uploaded Date)",
    "Pemilik Rekening (Account Owner)",
    "Bank",
    "Bukti Transfer (Receipt of Payment)",
    "Status Validasi (Validation Status)",
    "Tanggal Validasi (Validation Date)",
    "Aksi (Action)",
];

function BuktiTransferTable({ rows }: { rows: BuktiTransferRow[] }) {
    return (
        <div className={styles.tableWrapper}>
            <table>
                <thead>
                    <tr>
                        {TABLE_HEADERS.map((h) => (
                            <th key={h}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.length === 0 ? (
                        <tr>
                            <td
                                colSpan={TABLE_HEADERS.length}
                                style={{ textAlign: "center", padding: "1rem" }}
                            >
                                Belum ada bukti transfer. (No receipt of payment
                                yet.)
                            </td>
                        </tr>
                    ) : (
                        rows.map((row, i) => (
                            <tr key={i}>
                                <td>{row.tanggalUpload}</td>
                                <td>{row.pemilikRekening}</td>
                                <td>{row.bank}</td>
                                <td>
                                    {row.buktiTransferUrl ? (
                                        <button
                                            type="button"
                                            onClick={() => viewProtectedPdf(row.buktiTransferUrl, "bukti_transfer.pdf")}
                                            className={styles.buktiLink}
                                        >
                                            🧾 Bukti Transfer
                                        </button>
                                    ) : (
                                        "-"
                                    )}
                                </td>
                                <td>
                                    <span
                                        className={
                                            row.statusValidasi
                                                .toLowerCase()
                                                .includes("lunas") ||
                                            row.statusValidasi
                                                .toLowerCase()
                                                .includes("verified") ||
                                            row.statusValidasi
                                                .toLowerCase()
                                                .includes("diterima")
                                                ? styles.statusAccepted
                                                : ""
                                        }
                                    >
                                        {row.statusValidasi}
                                    </span>
                                </td>
                                <td>{row.tanggalValidasi}</td>
                                <td>
                                    {row.statusValidasi
                                        .toLowerCase()
                                        .includes("lunas") ||
                                    row.statusValidasi
                                        .toLowerCase()
                                        .includes("verified") ? (
                                        <a
                                            href={row.ropUrl}
                                            className={styles.btnRop}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            📋 Lihat ROP (View ROP)
                                        </a>
                                    ) : (
                                        "-"
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BuktiTransferPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const regID = searchParams.get("regID");

    const [biodata, setBiodata] = useState<BiodataPendaftaran>({
        nomorDaftar: "-",
        periode: "-",
        gelombang: "-",
        jurusan: "-",
        namaLengkap: "-",
        alamatEmail: "-",
        nomorNIK: "-",
    });
    const [rows, setRows] = useState<BuktiTransferRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!regID) return;

        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Fetch registration biodata
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

                // Fetch tuition fee history
                try {
                    const tf = await api.transferProof.getHistory(regID);
                    if (tf && typeof tf === "object" && !Array.isArray(tf)) {
                        // Mapped single object if backend only returns one
                        const p = tf as any;
                        if (p.registration_id === regID) {
                            const mappedRow: BuktiTransferRow = {
                                tanggalUpload: p.uploaded_at || "-",
                                pemilikRekening: p.account_holder,
                                bank: p.bank_name,
                                buktiTransferUrl: `/api/transfer-proof/file/${regID}`,
                                statusValidasi: p.status,
                                tanggalValidasi: p.verified_at || "-",
                                ropUrl: "#",
                            };
                            setRows([mappedRow]);
                        }
                    } else if (Array.isArray(tf)) {
                        const mappedRows: BuktiTransferRow[] = (tf as any[])
                            .filter((p) => p.registration_id === regID)
                            .map((p) => ({
                                tanggalUpload: p.uploaded_at || "-",
                                pemilikRekening: p.account_holder,
                                bank: p.bank_name,
                                buktiTransferUrl: `/api/transfer-proof/file/${regID}`,
                                statusValidasi: p.status,
                                tanggalValidasi: p.verified_at || "-",
                                ropUrl: "#",
                            }));
                        setRows(mappedRows);
                    }
                } catch (err) {
                    if (err instanceof ApiError && err.status === 404) {
                        setRows([]);
                    } else {
                        console.error("Failed to fetch tuition fee", err);
                        toast.error("Gagal mengambil data riwayat pembayaran.");
                    }
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [regID]);

    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <h2 className={styles.sectionTitle}>
                    Biodata Pendaftaran (Registration Data)
                </h2>
                {isLoading ? (
                    <p>Loading...</p>
                ) : (
                    <BiodataSection data={biodata} />
                )}

                <h3 className={styles.tableTitle}>
                    Daftar Bukti Transfer (List of Receipt of Payment)
                </h3>
                <BuktiTransferTable rows={rows} />

                <div className={styles.bottomActions}>
                    <button
                        className={styles.btnWarning}
                        onClick={() => router.back()}
                    >
                        ← Kembali (Back)
                    </button>
                    <button
                        className={styles.btnSuccess}
                        onClick={() =>
                            router.push(
                                `/account/transfer-proof/upload-transfer-proof?regID=${regID}`,
                            )
                        }
                    >
                        + Tambah Bukti Transfer (Add Receipt of Payment)
                    </button>
                </div>
            </div>
        </main>
    );
}
