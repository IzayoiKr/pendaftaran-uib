'use client';

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/api";
import { toast } from "sonner";
import styles from "./TransferProof.module.scss";

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

interface BuktiTransferRow {
    tanggalUpload:    string;
    pemilikRekening:  string;
    bank:             string;
    buktiTransferUrl: string;
    statusValidasi:   string;
    tanggalValidasi:  string;
    ropUrl:           string;
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
                    <tr>{TABLE_HEADERS.map(h => <th key={h}>{h}</th>)}</tr>
                </thead>
                <tbody>
                    {rows.length === 0 ? (
                        <tr>
                            <td colSpan={TABLE_HEADERS.length} style={{ textAlign: "center", padding: "1rem" }}>
                                Belum ada bukti transfer. (No receipt of payment yet.)
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
                                        <a href={row.buktiTransferUrl} className={styles.buktiLink}
                                            target="_blank" rel="noopener noreferrer">
                                            🧾 Bukti Transfer
                                        </a>
                                    ) : "-"}
                                </td>
                                <td>
                                    <span className={
                                        row.statusValidasi.toLowerCase().includes("lunas") || 
                                        row.statusValidasi.toLowerCase().includes("verified") ||
                                        row.statusValidasi.toLowerCase().includes("diterima")
                                            ? styles.statusAccepted : ""
                                    }>
                                        {row.statusValidasi}
                                    </span>
                                </td>
                                <td>{row.tanggalValidasi}</td>
                                <td>
                                    {row.statusValidasi.toLowerCase().includes("lunas") || 
                                     row.statusValidasi.toLowerCase().includes("verified") ? (
                                        <a href={row.ropUrl} className={styles.btnRop}
                                            target="_blank" rel="noopener noreferrer">
                                            📋 Lihat ROP (View ROP)
                                        </a>
                                    ) : "-"}
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
    const nomorDaftar = searchParams.get("nomorDaftar");

    const [biodata, setBiodata] = useState<BiodataPendaftaran>({
        nomorDaftar: nomorDaftar || "",
        periode: "",
        gelombang: "",
        jurusan: "",
        namaLengkap: "",
        alamatEmail: "",
        nomorNIK: "",
    });
    const [rows, setRows] = useState<BuktiTransferRow[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!nomorDaftar) return;

        const fetchData = async () => {
            setIsLoading(true);
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

                    // If there's payment records
                    if (data.payments && Array.isArray(data.payments)) {
                        const mappedRows: BuktiTransferRow[] = data.payments.map((p: any) => ({
                            tanggalUpload: p.created_at ? new Date(p.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : "-",
                            pemilikRekening: p.pemilik_rekening || "-",
                            bank: p.bank || "-",
                            buktiTransferUrl: p.bukti_bayar_path,
                            statusValidasi: p.status || "Masih dalam pemeriksaan",
                            tanggalValidasi: p.validation_date ? new Date(p.validation_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : "-",
                            ropUrl: `/api/registration/${nomorDaftar}/rop/${p.id}`, // Specific ROP URL
                        }));
                        setRows(mappedRows);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch registration details", err);
                toast.error("Gagal mengambil data pendaftaran. (Failed to fetch registration data.)");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [nomorDaftar]);

    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <h2 className={styles.sectionTitle}>Biodata Pendaftaran (Registration Data)</h2>
                {isLoading ? <p>Loading...</p> : <BiodataSection data={biodata} />}

                <h3 className={styles.tableTitle}>
                    Daftar Bukti Transfer (List of Receipt of Payment)
                </h3>
                <BuktiTransferTable rows={rows} />

                <div className={styles.bottomActions}>
                    <button className={styles.btnWarning} onClick={() => router.back()}>
                        ← Kembali (Back)
                    </button>
                    <button 
                        className={styles.btnSuccess} 
                        onClick={() => router.push(`/account/transfer-proof/upload-transfer-proof?nomorDaftar=${nomorDaftar}`)}
                    >
                        + Tambah Bukti Transfer (Add Receipt of Payment)
                    </button>
                </div>
            </div>
        </main>
    );
}
