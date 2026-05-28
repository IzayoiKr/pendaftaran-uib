"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import GetInitials from "@/utils/GetInitials";
import { toast } from "sonner";
import { api } from "@/api";
import useAuthStore from "@/store/useAuthStore";
import {
    CancelIcon,
    CheckIcon,
    ClipboardIcon,
    ClockIcon,
    DownloadIcon,
    EditIcon,
    FileIcon,
    LightningIcon,
    LockIcon,
    LogoutIcon,
    MoneyIcon,
    ProfileIcon,
    TrashIcon,
    WarningIcon,
} from "@/components/Icons/Icons";
import NIKReveal from "@/components/NIKReveal/NIKReveal";
import type { User } from "@/types/api";
import AccountSkeleton from "./Account.skeleton";
import styles from "./Account.module.scss";

// ─── Mock Toggle ─────────────────────────────────────────────────────────────
const DESIGN_STATE = "examinee" as
    | "draft"
    | "submitted"
    | "rejected"
    | "examinee";

function StatusIcon({ status }: { status: string }) {
    if (status === "submitted" || status === "examinee")
        return <CheckIcon className={styles.statusIconSvg} />;
    if (status === "rejected")
        return <WarningIcon className={styles.statusIconSvg} />;
    return <ClockIcon className={styles.statusIconSvg} />;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProfileHero({ user }: { user: User }) {
    return (
        <div className={styles.profileHero}>
            <div className={styles.heroInner}>
                <div className={styles.avatar}>
                    {user.full_name ? GetInitials(user.full_name) : "?"}
                </div>
                <div className={styles.heroText}>
                    <h1 className={styles.heroName}>{user.full_name || "-"}</h1>
                    <p className={styles.heroSubtitle}>Akun Mahasiswa</p>
                </div>
            </div>
        </div>
    );
}

function AccountDetails({ user }: { user: User }) {
    return (
        <section className={styles.card}>
            <div className={styles.cardHeaderLine}>
                <ProfileIcon className={styles.cardHeaderIcon} />
                <h2 className={styles.cardTitle}>Detail Akun</h2>
            </div>
            <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Alamat Email</span>
                    <span className={styles.detailValue}>
                        {user.email || "-"}
                    </span>
                </div>
                <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Nomor NIK</span>
                    <span className={styles.detailValue}>
                        <NIKReveal masked={user.nik || "-"} />
                    </span>
                </div>
            </div>
        </section>
    );
}

function RegistrationCard() {
    const statusMap = {
        draft: { label: "DRAFT", color: "draft" },
        submitted: { label: "TERKIRIM", color: "submitted" },
        rejected: { label: "DITOLAK", color: "rejected" },
        examinee: { label: "PESERTA UJIAN", color: "examinee" },
    };

    const current = statusMap[DESIGN_STATE];

    return (
        <section className={`${styles.card} ${styles.cardAccent}`}>
            <div className={styles.cardHeaderLine}>
                <FileIcon className={styles.cardHeaderIcon} />
                <h2 className={styles.cardTitle}>Status Pendaftaran</h2>
                <span
                    className={styles.statusBadge}
                    data-status={current.color}
                >
                    <StatusIcon status={current.color} />
                    {current.label}
                </span>
            </div>

            <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                    <span className={styles.infoItemLabel}>
                        Periode Akademik
                    </span>
                    <span className={styles.infoItemValue}>2026/2027</span>
                </div>
                <div className={styles.infoItem}>
                    <span className={styles.infoItemLabel}>Gelombang</span>
                    <span className={styles.infoItemValue}>
                        Gelombang 2 — Juni 2026
                    </span>
                </div>
                <div className={styles.infoItem}>
                    <span className={styles.infoItemLabel}>Jenjang</span>
                    <span className={styles.infoItemValue}>S1 (Strata 1)</span>
                </div>
                <div className={styles.infoItem}>
                    <span className={styles.infoItemLabel}>Jadwal USM</span>
                    <span className={styles.infoItemValue}>
                        15 Juli 2026, 08:00 WIB
                    </span>
                </div>
                {(DESIGN_STATE === "draft" || DESIGN_STATE === "rejected") && (
                    <div className={styles.infoItem}>
                        <span className={styles.infoItemLabel}>
                            Batas Akhir
                        </span>
                        <span className={styles.infoItemValue}>
                            30 Juni 2026
                            <span
                                className={styles.countdownBadge}
                                data-urgent="true"
                            >
                                5 hari tersisa
                            </span>
                        </span>
                    </div>
                )}
            </div>

            {DESIGN_STATE === "rejected" && (
                <div className={styles.alertBox} data-variant="warning">
                    <div className={styles.alertTitle}>
                        <WarningIcon />
                        Perhatian
                    </div>
                    <div className={styles.infoGrid}>
                        <div className={styles.infoItem}>
                            <span className={styles.infoItemLabel}>
                                Kelengkapan Formulir
                            </span>
                            <span
                                className={styles.infoItemValue}
                                data-status="incomplete"
                            >
                                Belum Lengkap
                            </span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.infoItemLabel}>
                                Status Pembayaran
                            </span>
                            <span
                                className={styles.infoItemValue}
                                data-status="unpaid"
                            >
                                Belum Lunas
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {DESIGN_STATE === "examinee" && (
                <div className={styles.examineeInfo}>
                    <div className={styles.infoItem}>
                        <span className={styles.infoItemLabel}>
                            Nomor Pendaftaran
                        </span>
                        <span className={styles.infoItemValue} data-mono>
                            2026001234
                        </span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.infoItemLabel}>
                            Password USM
                        </span>
                        <span className={styles.infoItemValue} data-mono>
                            Uib#1234
                        </span>
                    </div>
                </div>
            )}

            <div className={styles.actionBar}>
                {DESIGN_STATE === "draft" && (
                    <>
                        <button
                            className={`${styles.btn} ${styles.btnPrimary}`}
                        >
                            <EditIcon /> Edit Draft
                        </button>
                        <button
                            className={`${styles.btn} ${styles.btnDangerOutline}`}
                        >
                            <TrashIcon /> Hapus Draft
                        </button>
                    </>
                )}

                {DESIGN_STATE === "submitted" && (
                    <>
                        <button
                            className={`${styles.btn} ${styles.btnPrimary}`}
                        >
                            <FileIcon /> Lihat Formulir
                        </button>
                        <button
                            className={`${styles.btn} ${styles.btnWarningOutline}`}
                        >
                            <CancelIcon /> Batalkan
                        </button>
                    </>
                )}

                {DESIGN_STATE === "rejected" && (
                    <>
                        <button
                            className={`${styles.btn} ${styles.btnPrimary}`}
                        >
                            <EditIcon /> Edit Formulir
                        </button>
                        <button
                            className={`${styles.btn} ${styles.btnDangerOutline}`}
                        >
                            <TrashIcon /> Hapus Formulir
                        </button>
                    </>
                )}

                {DESIGN_STATE === "examinee" && (
                    <div className={styles.actionGrid}>
                        <button
                            className={`${styles.btn} ${styles.btnPrimary}`}
                        >
                            <DownloadIcon /> Surat Hasil
                        </button>
                        <button
                            className={`${styles.btn} ${styles.btnSecondaryOutline}`}
                        >
                            <MoneyIcon /> Bukti Transfer
                        </button>
                        <button
                            className={`${styles.btn} ${styles.btnSecondaryOutline}`}
                        >
                            <EditIcon /> Perubahan Prodi
                        </button>
                        <button
                            className={`${styles.btn} ${styles.btnDangerOutline}`}
                        >
                            <CancelIcon /> Pengunduran Diri
                        </button>
                        <button
                            className={`${styles.btn} ${styles.btnSecondaryOutline}`}
                        >
                            <ClipboardIcon /> Prasyarat OSPEK
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}

function EmptyRegistration() {
    const router = useRouter();
    return (
        <section className={`${styles.card} ${styles.cardEmpty}`}>
            <div className={styles.emptyVisual}>
                <FileIcon />
            </div>
            <h3 className={styles.emptyTitle}>Belum Ada Pendaftaran</h3>
            <p className={styles.emptyText}>
                Anda belum melakukan pendaftaran program studi apapun. Silahkan
                pilih gelombang yang tersedia.
            </p>
            <button
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={() => router.push("/#gelombang")}
            >
                Daftar Gelombang Sekarang
            </button>
        </section>
    );
}

function QuickActions({ isLoggingOut }: { isLoggingOut: boolean }) {
    const router = useRouter();
    const logout = useAuthStore((s) => s.logout);

    const handleLogout = async () => {
        const toastId = toast.loading("Sedang logout...");
        try {
            await api.auth.logout();
            logout();
            toast.success("Logout berhasil!", { id: toastId });
            router.push("/login");
        } catch (err) {
            toast.error(
                err instanceof Error
                    ? err.message
                    : "Logout gagal! Coba lagi...",
                { id: toastId },
            );
        }
    };

    return (
        <section className={styles.card}>
            <div className={styles.cardHeaderLine}>
                <LightningIcon className={styles.cardHeaderIcon} />
                <h2 className={styles.cardTitle}>Aksi Cepat</h2>
            </div>
            <div className={styles.quickGrid}>
                <button
                    className={styles.quickBtn}
                    onClick={() => router.push("/account/change-password")}
                    disabled={isLoggingOut}
                >
                    <LockIcon />
                    <span>Ubah Password</span>
                </button>
                <button
                    className={styles.quickBtn}
                    onClick={() => router.push("/account/update-profile")}
                    disabled={isLoggingOut}
                >
                    <ProfileIcon />
                    <span>Ubah Profile</span>
                </button>
                <button
                    className={`${styles.quickBtn} ${styles.quickBtnDanger}`}
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    aria-busy={isLoggingOut}
                >
                    <LogoutIcon />
                    <span>Logout</span>
                </button>
            </div>
        </section>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Account() {
    const { user, isLoggingOut } = useAuthStore();
    const [isFetching, setIsFetching] = useState(true);

    useEffect(() => {
        if (!user) return;
        api.profile
            .get()
            .then((freshUser) => {
                const current = useAuthStore.getState().user;
                if (JSON.stringify(current) !== JSON.stringify(freshUser)) {
                    useAuthStore.getState().setUser(freshUser);
                }
            })
            .catch(() => {})
            .finally(() => setIsFetching(false));
    }, [user]);

    if (isFetching) return <AccountSkeleton />;
    if (!user) return null;

    const hasRegistration = true; // TODO: derive from real data

    return (
        <section className={styles.account}>
            <ProfileHero user={user} />

            <main className={styles.accountContent}>
                <div className={styles.layoutGrid}>
                    <div className={styles.mainColumn}>
                        {hasRegistration ? (
                            <RegistrationCard />
                        ) : (
                            <EmptyRegistration />
                        )}
                    </div>

                    <aside className={styles.sideColumn}>
                        <AccountDetails user={user} />
                        <QuickActions isLoggingOut={isLoggingOut} />
                    </aside>
                </div>
            </main>
        </section>
    );
}
