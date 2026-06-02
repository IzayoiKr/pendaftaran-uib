"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/api";
import styles from "./Prodi.module.scss";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BiodataPendaftaran {
    periode: string;
    gelombang: string;
    jurusan: string;
    namaLengkap: string;
    alamatEmail: string;
    nomorNIK: string;
}

interface RequestPerpindahan {
    id: string;
    createdAt: string;
    previousProgramStudi: string;
    newProgramStudi: string;
    previousClassSession: string;
    newClassSession: string;
    status: string;
    updatedAt: string;
    notes?: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function BiodataSection({ data }: { data: BiodataPendaftaran }) {
    const rows: [string, string][] = [
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

const TABLE_HEADERS = [
    "Tanggal Request (Request Date)",
    "Program Studi Sebelumnya (Previous Major)",
    "Program Studi Perpindahan (New Major)",
    "Waktu Kuliah Sebelumnya (Previous Shift)",
    "Waktu Kuliah Perpindahan (New Shift)",
    "Status Validasi (Validation Status)",
    "Tanggal Validasi (Validation Date)",
    "Catatan (Notes)",
];

function RequestTable({ requests }: { requests: RequestPerpindahan[] }) {
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
                    {requests.length === 0 ? (
                        <tr>
                            <td
                                className={styles.emptyRow}
                                colSpan={TABLE_HEADERS.length}
                            >
                                Belum ada request perpindahan prodi. (No major
                                change requests yet.)
                            </td>
                        </tr>
                    ) : (
                        requests.map((req) => (
                            <tr key={req.id}>
                                <td>{req.createdAt.split(" ")[0]}</td>
                                <td>{req.previousProgramStudi}</td>
                                <td>{req.newProgramStudi}</td>
                                <td>{req.previousClassSession}</td>
                                <td>{req.newClassSession}</td>
                                <td>{req.status}</td>
                                <td>{req.updatedAt.split(" ")[0]}</td>
                                <td>{req.notes || "-"}</td>
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
    const regID = searchParams.get("regID");

    const [isFetchingData, setIsFetchingData] = useState(false);
    const [biodata, setBiodata] = useState<BiodataPendaftaran>({
        periode: "",
        gelombang: "",
        jurusan: "",
        namaLengkap: "",
        alamatEmail: "",
        nomorNIK: "",
    });

    const [requests, setRequests] = useState<RequestPerpindahan[]>([]);

    useEffect(() => {
        if (!regID) return;

        const fetchData = async () => {
            setIsFetchingData(true);
            try {
                const res = await api.profile.getRegistration(regID);
                if (res) {
                    const { registration, user, current_prodi } = res;
                    setBiodata({
                        periode: registration.academic_year || "-",
                        gelombang: registration.batch_name || "-",
                        jurusan: current_prodi || "-",
                        namaLengkap: user.full_name || "-",
                        alamatEmail: user.email || "-",
                        nomorNIK: user.nik || "-",
                    });
                }

                const history = await api.prodiChange.getHistory();
                setRequests(
                    history
                        .filter((r) => r.registration_id === regID)
                        .map((r) => ({
                            id: r.id,
                            createdAt: r.created_at,
                            previousProgramStudi: r.previous_program_studi,
                            newProgramStudi: r.new_program_studi,
                            previousClassSession: r.previous_class_session,
                            newClassSession: r.new_class_session,
                            status: r.status,
                            updatedAt: r.updated_at,
                            notes: r.notes,
                        })),
                );
            } catch (err) {
                console.error("Failed to fetch registration details", err);
                toast.error("Gagal mengambil data pendaftaran.");
            } finally {
                setIsFetchingData(false);
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
                {isFetchingData ? (
                    <p>Loading...</p>
                ) : (
                    <BiodataSection data={biodata} />
                )}

                <h3 className={styles.tableTitle}>
                    Daftar Request Pemindahan Prodi (List of Major Change
                    Requests)
                </h3>
                <RequestTable requests={requests} />

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
                                `/account/prodi/change-prodi?regID=${regID}`,
                            )
                        }
                    >
                        + Request Perpindahan Prodi (Request Major Change)
                    </button>
                </div>
            </div>
        </main>
    );
}
