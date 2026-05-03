'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/api";
import useAuthStore from "@/store/useAuthStore";
import type { User } from "@/types";
import styles from "./Account.module.scss";
import { RegisterIcon, EditIcon, LetterIcon, ReceiptIcon, ChangeIcon, EraserIcon, LockIcon, LogoutIcon, ProfileIcon } from "@/components/Icons/Icons";
import { downloadSuratHasil, downloadStaticPdf } from "@/utils/downloadPdf";

// ─── Types ────────────────────────────────────────────────────────────────────

type BiodataStatus = "Belum Lengkap" | "Telah Lengkap";
type PaymentStatus = "Belum Lunas"   | "Telah Lunas";

interface Registration {
    nomorDaftar: string;
    periode:     number;
    gelombang:   string;
    jurusan:     string;
    biodata:     BiodataStatus;
    pembayaran:  PaymentStatus;
    usm:         string;
    passwordUSM: string;
}

interface RegistrationHandlers {
    onCheckPendaftaran:    (reg: Registration) => void;
    onUbahBiodata:         (reg: Registration) => void;
    onDownloadSuratHasil:  (reg: Registration) => void;
    onBuktiTransfer:       (reg: Registration) => void;
    onPerubahanProdi:      (reg: Registration) => void;
    onDownloadPengunduran: (reg: Registration) => void;
    onPrasyaratOspek:      (reg: Registration) => void;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function AccountInfo({ user }: { user: User }) {
    const rows: [string, string][] = [
        ["Nama Lengkap", user.full_name || "-"],
        ["Alamat Email", user.email     || "-"],
        ["Nomor NIK",    user.nik       || "-"],
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
        status === "Telah Lengkap" ? styles.statusComplete   :
        status === "Belum Lengkap" ? styles.statusIncomplete  :
        status === "Telah Lunas"   ? styles.statusPaid        :
        styles.statusUnpaid;
    return <span className={cls}>{status || "-"}</span>;
}

function RegistrationActions({ reg, handlers }: {
    reg: Registration; handlers: RegistrationHandlers;
}) {
    const isComplete = reg.biodata === "Telah Lengkap" && reg.pembayaran === "Telah Lunas";
    return (
        <div className={styles.actionGroup}>
            <button className={`${styles.btn} ${styles.btnWarning}`}
                onClick={() => handlers.onCheckPendaftaran(reg)}>
                <RegisterIcon /> Check Pendaftaran
            </button>
            <button className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={() => handlers.onUbahBiodata(reg)}>
                <EditIcon /> Ubah Biodata
            </button>
            {isComplete && (
                <>
                    <button className={`${styles.btn} ${styles.btnSuccess}`}
                        onClick={() => handlers.onDownloadSuratHasil(reg)}>
                        <LetterIcon /> Surat Hasil
                    </button>
                    <button className={`${styles.btn} ${styles.btnInfo}`}
                        onClick={() => handlers.onBuktiTransfer(reg)}>
                        <ReceiptIcon /> Bukti Transfer
                    </button>
                    <button className={`${styles.btn} ${styles.btnPrimary}`}
                        onClick={() => handlers.onPerubahanProdi(reg)}>
                        <ChangeIcon /> Perubahan Prodi
                    </button>
                    <button className={`${styles.btn} ${styles.btnDanger}`}
                        onClick={() => handlers.onDownloadPengunduran(reg)}>
                        <EraserIcon /> Pengunduran Diri
                    </button>
                    <button className={`${styles.btn} ${styles.btnWarning}`}
                        onClick={() => handlers.onPrasyaratOspek(reg)}>
                        <ProfileIcon /> Prasyarat Ospek
                    </button>
                </>
            )}
        </div>
    );
}

const TABLE_HEADERS = [
    "Nomor Daftar", "Periode", "Gelombang", "Jurusan",
    "Biodata", "Pembayaran", "USM", "Password USM", "Aksi",
];

function RegistrationTable({ registrations, handlers }: {
    registrations: Registration[]; handlers: RegistrationHandlers;
}) {
    return (
        <div className={styles.tableWrapper}>
            <table>
                <thead><tr>{TABLE_HEADERS.map(h => <th key={h}>{h}</th>)}</tr></thead>
                <tbody>
                    {registrations.map(reg => (
                        <tr key={reg.nomorDaftar}>
                            <td>{reg.nomorDaftar || "-"}</td>
                            <td>{reg.periode     || "-"}</td>
                            <td>{reg.gelombang   || "-"}</td>
                            <td>{reg.jurusan     || "-"}</td>
                            <td><StatusBadge status={reg.biodata}    /></td>
                            <td><StatusBadge status={reg.pembayaran} /></td>
                            <td>{reg.usm         || "-"}</td>
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
    const [registrations] = useState<Registration[]>([]);
    const [isLogout, setIsLogout] = useState(false);

    // ── Fetch profile terbaru ──────────────────────────────────────────────────
    useEffect(() => {
        if (user) {
            api.profile.profile()
                .then(freshUser => {
                    const current = useAuthStore.getState().user;
                    if (JSON.stringify(current) !== JSON.stringify(freshUser)) {
                        useAuthStore.getState().setUser(freshUser);
                    }
                })
                .catch(() => {});
        }
    }, [user]);

    // ── Auth guard ────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!isLoading && !user) {
            router.push(`/login?from=${encodeURIComponent(window.location.pathname)}`);
        }
    }, [isLoading, user, router]);

    if (isLoading) return <div>Loading...</div>;
    if (!user)     return null;

    const handleLogout = async () => {
        setIsLogout(true);
        const toastId = toast.loading("Sedang logout...");
        try {
            await api.auth.logout();
            logout();
            toast.success("Logout berhasil!", { id: toastId });
            router.push("/login");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Logout gagal! Coba lagi...", { id: toastId });
        } finally {
            setIsLogout(false);
        }
    };

    const handlers: RegistrationHandlers = {
        onCheckPendaftaran: () => router.push("/"),

        onUbahBiodata: (reg) =>
            router.push(`/biodata?nomorDaftar=${reg.nomorDaftar}`),

        // Buka Surat Hasil sebagai HTML di tab baru → user Ctrl+P → Save as PDF
        onDownloadSuratHasil: (reg) => {
            downloadSuratHasil(reg.nomorDaftar);
        },

        onBuktiTransfer: (reg) =>
            router.push(`/account/transfer-proof?nomorDaftar=${reg.nomorDaftar}`),

        onPerubahanProdi: (reg) =>
            router.push(`/account/prodi?nomorDaftar=${reg.nomorDaftar}`),

        // Download surat pengunduran diri (file statis dari folder private/)
        onDownloadPengunduran: () => {
            downloadStaticPdf("pengunduran", "pengunduran.pdf").catch(err =>
                toast.error(err instanceof Error ? err.message : "Gagal download surat pengunduran")
            );
        },

        onPrasyaratOspek: (reg) =>
            router.push(`/account/prasyarat-ospek?nomorDaftar=${reg.nomorDaftar}`),
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
                        className={`${styles.btnLg} ${styles.btnLgWarning}`}
                        onClick={() => router.push("/account/change-password")}
                        disabled={isLogout}
                    >
                        <LockIcon /> UBAH PASSWORD
                    </button>
                    <button
                        className={`${styles.btnLg} ${styles.btnLgGrey}`}
                        onClick={() => router.push("/account/update-profile")}
                        disabled={isLogout}
                    >
                        <ProfileIcon /> UBAH PROFILE
                    </button>
                    <button
                        className={`${styles.btnLg} ${styles.btnLgDanger}`}
                        onClick={handleLogout}
                        disabled={isLogout}
                        aria-busy={isLogout}
                    >
                        <LogoutIcon /> LOGOUT
                    </button>
                </div>
            </div>
        </div>
    );
}