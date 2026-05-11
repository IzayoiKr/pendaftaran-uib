'use client';

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/api";
import { toast } from "sonner";
import styles from "./Prodi.module.scss";

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

interface RequestPerpindahan {
    tanggalRequest:          string;
    programStudiSebelumnya:  string;
    programStudiPerpindahan: string;
    waktuKuliahSebelumnya:   string;
    waktuKuliahPerpindahan:  string;
    statusValidasi:          string;
    tanggalValidasi:         string;
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
    "Tanggal Request (Request Date)", "Program Studi Sebelumnya (Previous Major)", "Program Studi Perpindahan (New Major)",
    "Waktu Kuliah Sebelumnya (Previous Shift)", "Waktu Kuliah Perpindahan (New Shift)",
    "Status Validasi (Validation Status)", "Tanggal Validasi (Validation Date)", "Aksi (Action)",
];

function RequestTable({ requests }: { requests: RequestPerpindahan[] }) {
    return (
        <div className={styles.tableWrapper}>
            <table>
                <thead>
                    <tr>{TABLE_HEADERS.map(h => <th key={h}>{h}</th>)}</tr>
                </thead>
                <tbody>
                    {requests.length === 0 ? (
                        <tr>
                            <td className={styles.emptyRow} colSpan={TABLE_HEADERS.length}>
                                Belum ada request perpindahan prodi. (No major change requests yet.)
                            </td>
                        </tr>
                    ) : (
                        requests.map((req, i) => (
                            <tr key={i}>
                                <td>{req.tanggalRequest}</td>
                                <td>{req.programStudiSebelumnya}</td>
                                <td>{req.programStudiPerpindahan}</td>
                                <td>{req.waktuKuliahSebelumnya}</td>
                                <td>{req.waktuKuliahPerpindahan}</td>
                                <td>{req.statusValidasi}</td>
                                <td>{req.tanggalValidasi}</td>
                                <td>{/* TODO: aksi per row */}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PerubahanProdiPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const nomorDaftar = searchParams.get("nomorDaftar");

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

    const [requests, setRequests] = useState<RequestPerpindahan[]>([]);

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
                    
                    // Fetch perpindahan prodi requests if endpoint exists
                    // For now, we'll keep it empty or mock it if there's no backend yet
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

    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <h2 className={styles.sectionTitle}>Biodata Pendaftaran (Registration Data)</h2>
                {isFetchingData ? <p>Loading...</p> : <BiodataSection data={biodata} />}

                <h3 className={styles.tableTitle}>Daftar Request Pemindahan Prodi (List of Major Change Requests)</h3>
                <RequestTable requests={requests} />

                <div className={styles.bottomActions}>
                    <button className={styles.btnWarning} onClick={() => router.back()}>
                        ← Kembali (Back)
                    </button>
                    <button 
                        className={styles.btnSuccess} 
                        onClick={() => router.push(`/account/prodi/prodi-request?nomorDaftar=${nomorDaftar}`)}
                    >
                        + Request Perpindahan Prodi (Request Major Change)
                    </button>
                </div>
            </div>
        </main>
    );
}
