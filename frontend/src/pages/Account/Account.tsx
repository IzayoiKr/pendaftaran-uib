'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/api";
import useAuthStore from "@/store/useAuthStore";
import type { User } from "@/types";
import styles from "./Account.module.scss";

// ─── Types ────────────────────────────────────────────────────────────────────

type BiodataStatus = "Belum Lengkap" | "Telah Lengkap";
type PaymentStatus = "Belum Lunas" | "Telah Lunas";

interface Registration {
    nomorDaftar: string;
    periode: number;
    gelombang: string;
    jurusan: string;
    biodata: BiodataStatus;
    pembayaran: PaymentStatus;
    usm: string;
    passwordUSM: string;
}

interface RegistrationHandlers {
    onCheckPendaftaran: (reg: Registration) => void;
    onUbahBiodata: (reg: Registration) => void;
    onDownloadSuratHasil: (reg: Registration) => void;
    onBuktiTransfer: (reg: Registration) => void;
    onPerubahanProdi: (reg: Registration) => void;
    onDownloadPengunduran: (reg: Registration) => void;
    onPrasyaratOspek: (reg: Registration) => void;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function AccountInfo({ user }: { user: User }) {
    const rows: [string, string][] = [
        ["Nama Lengkap", user.full_name || "-"],
        ["Alamat Email", user.email || "-"],
        ["Nomor NIK", user.nik || "-"],
    ];

    return (
        <div className={styles.accountInfo}>
            {rows.map(([label, value]) => (
                <div key={label} className={styles.infoRow}>
                    <span className={styles.infoLabel}>{label}</span>
                    <span className={styles.infoValue}>: {value}</span>
                </div>
            ))}
        </div>
    );
}

function StatusBadge({ status }: { status: BiodataStatus | PaymentStatus }) {
    const cls =
        status === "Telah Lengkap" ? styles.statusComplete :
            status === "Belum Lengkap" ? styles.statusIncomplete :
                status === "Telah Lunas" ? styles.statusPaid :
                    styles.statusUnpaid;
    return <span className={cls}>{status || "-"}</span>;
}

function RegistrationActions({ reg, handlers }: { reg: Registration; handlers: RegistrationHandlers }) {
    const isComplete = reg.biodata === "Telah Lengkap" && reg.pembayaran === "Telah Lunas";

    return (
        <div className={styles.actionGroup}>
            <button className={`${styles.btn} ${styles.btnWarning}`} onClick={() => handlers.onCheckPendaftaran(reg)}>Check Pendaftaran</button>
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => handlers.onUbahBiodata(reg)}>Ubah Biodata</button>
            {isComplete && (
                <>
                    <button className={`${styles.btn} ${styles.btnSuccess}`} onClick={() => handlers.onDownloadSuratHasil(reg)}>Surat Hasil</button>
                    <button className={`${styles.btn} ${styles.btnInfo}`} onClick={() => handlers.onBuktiTransfer(reg)}>Bukti Transfer</button>
                    <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => handlers.onPerubahanProdi(reg)}>Perubahan Prodi</button>
                    <button className={`${styles.btn} ${styles.btnDanger}`} onClick={() => handlers.onDownloadPengunduran(reg)}>Pengunduran Diri</button>
                    <button className={`${styles.btn} ${styles.btnWarning}`} onClick={() => handlers.onPrasyaratOspek(reg)}>Prasyarat Ospek</button>
                </>
            )}
        </div>
    );
}

const TABLE_HEADERS = [
    "Nomor Daftar", "Periode", "Gelombang", "Jurusan",
    "Biodata", "Pembayaran", "USM", "Password USM", "Aksi",
];

function RegistrationTable({ registrations, handlers }: { registrations: Registration[]; handlers: RegistrationHandlers }) {
    return (
        <div className={styles.tableWrapper}>
            <table>
                <thead>
                    <tr>{TABLE_HEADERS.map(h => <th key={h}>{h}</th>)}</tr>
                </thead>
                <tbody>
                    {registrations.map(reg => (
                        <tr key={reg.nomorDaftar}>
                            <td>{reg.nomorDaftar || "-"}</td>
                            <td>{reg.periode || "-"}</td>
                            <td>{reg.gelombang || "-"}</td>
                            <td>{reg.jurusan || "-"}</td>
                            <td><StatusBadge status={reg.biodata} /></td>
                            <td><StatusBadge status={reg.pembayaran} /></td>
                            <td>{reg.usm || "-"}</td>
                            <td>{reg.passwordUSM || "-"}</td>
                            <td><RegistrationActions reg={reg} handlers={handlers} /></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Account() {
    const { user, isLoading, logout } = useAuthStore();
    const router = useRouter();
    const [registrations, setRegistrations] = useState<Registration[]>([]);

    useEffect(() => {
        if (user) {
            api.auth.profile()
                .then(freshUser => {
                    const current = useAuthStore.getState().user;
                    if (JSON.stringify(current) !== JSON.stringify(freshUser)) {
                        useAuthStore.getState().setUser(freshUser);
                    }
                })
                .catch(() => {/* TODO handle errors */ })
        }
    }, [user]);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login");
        }
    }, [isLoading, user, router])

    if (isLoading) return <div>Loading...</div>;
    if (!user) return null;

    const handleLogout = async () => {
        try {
            await api.auth.logout();
        } catch {
            // token sudah mati di server, lanjutkan logout lokal
        }
        logout();
        toast.success("Logout Berhasil!");
    };

    const downloadPdf = (filename: string) => {
        const link = document.createElement("a");
        link.href = `/files/${filename}`;
        link.download = filename;
        link.click();
    };

    const handlers: RegistrationHandlers = {
        onCheckPendaftaran: () => router.push("/"),
        onUbahBiodata: (reg) => router.push(`/biodata?nomorDaftar=${reg.nomorDaftar}`), // TODO: ganti route sesuai Aldo
        onDownloadSuratHasil: (reg) => downloadPdf(`surat-hasil-${reg.nomorDaftar}.pdf`),
        onBuktiTransfer: (reg) => router.push(`/transferproof?nomorDaftar=${reg.nomorDaftar}`),
        onPerubahanProdi: (reg) => router.push(`/changeprodi?nomorDaftar=${reg.nomorDaftar}`),
        onDownloadPengunduran: (reg) => downloadPdf(`pengunduran-diri-${reg.nomorDaftar}.pdf`),
        onPrasyaratOspek: (reg) => router.push(`/prasyaratospek?nomorDaftar=${reg.nomorDaftar}`),
    };

    return (
        <div className={styles.pageContent}>
            <div className={styles.accountBox}>
                <h2 className={styles.accountTitle}>Akun Saya</h2>
                <AccountInfo user={user} />

                <h3 className={styles.sectionTitle}>Pendaftaran</h3>

                {registrations.length === 0 ? (
                    <div className={styles.emptyState}>
                        <p>Anda belum melakukan pendaftaran program studi apapun.</p>
                        <button
                            className={`${styles.btn} ${styles.btnPrimary}`}
                            onClick={() => router.push("/#gelombang")}
                        >
                            Daftar Gelombang Sekarang
                        </button>
                    </div>
                ) : (
                    <RegistrationTable registrations={registrations} handlers={handlers} />
                )}

                <div className={styles.bottomActions}>
                    <button
                        className={`${styles.btnLg} ${styles.btnWarning}`}
                        onClick={() => router.push("/account/change-password")}>UBAH PASSWORD
                    </button>
                    <button
                        className={`${styles.btnLg} ${styles.btnPrimary}`}
                        onClick={() => router.push("/account/change-profile")}>UBAH PROFILE
                    </button>
                    <button
                        className={`${styles.btnLg} ${styles.btnDanger}`}
                        onClick={handleLogout}>⏻ LOGOUT
                    </button>
                </div>
            </div>
        </div>
    );
}
