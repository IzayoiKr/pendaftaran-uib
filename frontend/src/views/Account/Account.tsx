"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import GetInitials from "@/utils/GetInitials";
import { toast } from "sonner";
import { api } from "@/api";
import useAuthStore from "@/store/useAuthStore";
import ConfirmDialog from "@/components/ConfirmDialog/ConfirmDialog";
import { useConfirm } from "@/components/ConfirmDialog/useConfirm";
import {
    CancelIcon,
    CheckIcon,
    ClipboardIcon,
    ClockIcon,
    DownloadIcon,
    EditIcon,
    EyeIcon,
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
import type { RegistrationCard, User } from "@/types/api";
import AccountSkeleton from "./Account.skeleton";
import styles from "./Account.module.scss";

type RegistrationStatus =
    | "DRAFT"
    | "SUBMITTED"
    | "REJECTED"
    | "VERIFIED"
    | "NONE";

function StatusIcon({ status }: { status: RegistrationStatus }) {
    if (status === "SUBMITTED" || status === "VERIFIED")
        return <CheckIcon className={styles.statusIconSvg} />;
    if (status === "REJECTED")
        return <WarningIcon className={styles.statusIconSvg} />;
    return <ClockIcon className={styles.statusIconSvg} />;
}

function getStatusConfig(
    status: RegistrationStatus,
    t: (key: string) => string,
) {
    const map: Record<RegistrationStatus, { label?: string; color?: string }> =
        {
            DRAFT: { label: t("statusDraft"), color: "draft" },
            SUBMITTED: { label: t("statusSubmitted"), color: "submitted" },
            REJECTED: { label: t("statusRejected"), color: "rejected" },
            VERIFIED: { label: t("statusVerified"), color: "examinee" },
            NONE: {},
        };
    return map[status];
}

function computeDaysRemaining(
    endDate?: string,
): { days: number; urgent: boolean } | undefined {
    if (!endDate) return undefined;
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil(
        (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diff < 0) return undefined;
    return { days: diff, urgent: diff <= 5 };
}

function formatEventDate(
    date?: string,
    time?: string,
    locale?: string,
    timezoneLabel?: string,
): string {
    if (!date) return "-";
    const d = new Date(date);
    const formatted = d.toLocaleDateString(locale || "id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
    return time ? `${formatted}, ${time}${timezoneLabel || " WIB"}` : formatted;
}

function ProfileHero({ user }: { user: User }) {
    const t = useTranslations("account");
    return (
        <div className={styles.profileHero}>
            <div className={styles.heroInner}>
                <div className={styles.avatar}>
                    {user.full_name ? GetInitials(user.full_name) : "?"}
                </div>
                <div className={styles.heroText}>
                    <h1 className={styles.heroName}>{user.full_name || "-"}</h1>
                    <p className={styles.heroSubtitle}>{t("studentAccount")}</p>
                </div>
            </div>
        </div>
    );
}

function AccountDetails({ user }: { user: User }) {
    const t = useTranslations("account");
    return (
        <section className={styles.card}>
            <div className={styles.cardHeaderLine}>
                <ProfileIcon className={styles.cardHeaderIcon} />
                <h2 className={styles.cardTitle}>{t("detailTitle")}</h2>
            </div>
            <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>
                        {t("emailLabel")}
                    </span>
                    <span className={styles.detailValue}>
                        {user.email || "-"}
                    </span>
                </div>
                <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>{t("nikLabel")}</span>
                    <span className={styles.detailValue}>
                        <NIKReveal masked={user.nik || "-"} />
                    </span>
                </div>
            </div>
        </section>
    );
}

function RegistrationCardItem({
    reg,
    onMutate,
}: {
    reg: RegistrationCard;
    onMutate: () => void;
}) {
    const router = useRouter();
    const locale = useLocale();
    const t = useTranslations("account");
    const [isLoading, setIsLoading] = useState<string | null>(null);
    const { confirm, dialogProps, setLoading } = useConfirm();

    const statusConfig = getStatusConfig(reg.status, t);
    const countdown = useMemo(
        () => computeDaysRemaining(reg.registration_end),
        [reg.registration_end],
    );

    const handleEdit = () => {
        router.push(`/registration/${reg.batch_key}?edit=1`);
    };

    const handleView = () => {
        router.push(`/registration/${reg.batch_key}?view=1`);
    };

    const handleViewLoA = async () => {
        setIsLoading("loa");
        const toastId = toast.loading("Memuat surat hasil...");
        try {
            const blob = await api.registrations.loa(reg.batch_key);

            if (blob.type === "application/json") {
                const text = await blob.text();
                const errJson = JSON.parse(text);
                throw new Error(errJson.error || "Gagal memuat surat hasil");
            }

            const viewUrl = URL.createObjectURL(blob);
            window.open(viewUrl, "_blank");

            const downloadUrl = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = `Letter_of_Acceptance_${reg.batch_key}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setTimeout(() => {
                URL.revokeObjectURL(viewUrl);
                URL.revokeObjectURL(downloadUrl);
            }, 100);

            toast.dismiss(toastId);
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Terjadi kesalahan";
            toast.error(message, { id: toastId });
        } finally {
            setIsLoading(null);
        }
    };

    const handleDelete = async () => {
        const confirmed = await confirm({
            title: t("deleteDraft"),
            message: t("confirmDelete"),
            confirmLabel: t("deleteDraft"),
            cancelLabel: t("cancel"),
            variant: "danger",
        });

        if (!confirmed) return;

        setIsLoading("delete");
        setLoading(true);
        const toastId = toast.loading(t("deleting"));
        try {
            await api.registrations.delete(reg.batch_key);
            toast.success(t("deleteSuccess"), { id: toastId });
            onMutate();
        } catch (err) {
            const message =
                err instanceof Error ? err.message : t("deleteError");
            toast.error(message, { id: toastId });
        } finally {
            setIsLoading(null);
            setLoading(false);
        }
    };

    const handleWithdraw = async () => {
        const confirmed = await confirm({
            title: t("withdraw"),
            message: t("confirmWithdraw"),
            confirmLabel: t("withdraw"),
            cancelLabel: t("cancel"),
            variant: "warning",
        });

        if (!confirmed) return;

        setIsLoading("withdraw");
        setLoading(true);
        const toastId = toast.loading(t("withdrawing"));
        try {
            await api.registrations.withdraw(reg.batch_key);
            toast.success(t("withdrawSuccess"), { id: toastId });
            onMutate();
        } catch (err) {
            const message =
                err instanceof Error ? err.message : t("withdrawError");
            toast.error(message, { id: toastId });
        } finally {
            setIsLoading(null);
            setLoading(false);
        }
    };

    const isActionDisabled = isLoading !== null;

    return (
        <section className={`${styles.card} ${styles.cardAccent}`}>
            <div className={styles.cardHeaderLine}>
                <FileIcon className={styles.cardHeaderIcon} />
                <h2 className={styles.cardTitle}>{t("registrationStatus")}</h2>
                <span
                    className={styles.statusBadge}
                    data-status={statusConfig.color}
                >
                    <StatusIcon status={reg.status} />
                    {statusConfig.label}
                </span>
            </div>

            <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                    <span className={styles.infoItemLabel}>
                        {t("academicYear")}
                    </span>
                    <span className={styles.infoItemValue}>
                        {reg.academic_year || "-"}
                    </span>
                </div>
                <div className={styles.infoItem}>
                    <span className={styles.infoItemLabel}>{t("batch")}</span>
                    <span className={styles.infoItemValue}>
                        {reg.batch_name || "-"}
                    </span>
                </div>
                <div className={styles.infoItem}>
                    <span className={styles.infoItemLabel}>{t("degree")}</span>
                    <span className={styles.infoItemValue}>
                        {reg.degree === "S1" ? t("degreeS1") : t("degreeS2")}{" "}
                        &mdash; {reg.batch_type}
                    </span>
                </div>
                <div className={styles.infoItem}>
                    <span className={styles.infoItemLabel}>
                        {t("examSchedule")}
                    </span>
                    <span className={styles.infoItemValue}>
                        {formatEventDate(
                            reg.event_date,
                            reg.start_time,
                            locale,
                            t("wib"),
                        )}
                    </span>
                </div>
                {(reg.status === "DRAFT" || reg.status === "REJECTED") &&
                    countdown && (
                        <div className={styles.infoItem}>
                            <span className={styles.infoItemLabel}>
                                {t("deadline")}
                            </span>
                            <span className={styles.infoItemValue}>
                                {reg.registration_end}
                                <span
                                    className={styles.countdownBadge}
                                    data-urgent={countdown.urgent}
                                >
                                    {countdown.days} {t("daysRemaining")}
                                </span>
                            </span>
                        </div>
                    )}
            </div>

            {reg.status === "REJECTED" &&
                (reg.feedback_document || reg.feedback_payment) && (
                    <div className={styles.alertBox} data-variant="warning">
                        <div className={styles.alertTitle}>
                            <WarningIcon />
                            {t("attention")}
                        </div>
                        <div className={styles.infoGrid}>
                            {reg.feedback_document && (
                                <div className={styles.infoItem}>
                                    <span className={styles.infoItemLabel}>
                                        {t("documentFeedback")}
                                    </span>
                                    <span
                                        className={styles.infoItemValue}
                                        data-status="incomplete"
                                    >
                                        {reg.feedback_document}
                                    </span>
                                </div>
                            )}
                            {reg.feedback_payment && (
                                <div className={styles.infoItem}>
                                    <span className={styles.infoItemLabel}>
                                        {t("paymentFeedback")}
                                    </span>
                                    <span
                                        className={styles.infoItemValue}
                                        data-status="unpaid"
                                    >
                                        {reg.feedback_payment}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

            <div className={styles.cardActions}>
                {reg.status === "DRAFT" && (
                    <>
                        <button
                            className={`${styles.btn} ${styles.btnPrimary}`}
                            onClick={handleEdit}
                            disabled={isActionDisabled}
                        >
                            <EditIcon /> {t("editDraft")}
                        </button>
                        <button
                            className={`${styles.btn} ${styles.btnDangerOutline}`}
                            onClick={handleDelete}
                            disabled={isActionDisabled}
                        >
                            <TrashIcon /> {t("deleteDraft")}
                        </button>
                    </>
                )}

                {reg.status === "SUBMITTED" && (
                    <>
                        <button
                            className={`${styles.btn} ${styles.btnPrimary}`}
                            onClick={handleView}
                            disabled={isActionDisabled}
                        >
                            <EyeIcon /> {t("viewForm")}
                        </button>
                        <button
                            className={`${styles.btn} ${styles.btnWarningOutline}`}
                            onClick={handleWithdraw}
                            disabled={isActionDisabled}
                        >
                            <CancelIcon /> {t("withdraw")}
                        </button>
                    </>
                )}

                {reg.status === "REJECTED" && (
                    <>
                        <button
                            className={`${styles.btn} ${styles.btnPrimary}`}
                            onClick={handleEdit}
                            disabled={isActionDisabled}
                        >
                            <EditIcon /> {t("editForm")}
                        </button>
                        <button
                            className={`${styles.btn} ${styles.btnDangerOutline}`}
                            onClick={handleDelete}
                            disabled={isActionDisabled}
                        >
                            <TrashIcon /> {t("deleteForm")}
                        </button>
                    </>
                )}

                {reg.status === "VERIFIED" && (
                    <div className={styles.actionGrid}>
                        <button
                            className={`${styles.btn} ${styles.btnPrimary}`}
                            onClick={handleViewLoA}
                            disabled={isActionDisabled}
                        >
                            <DownloadIcon /> {t("resultLetter")}
                        </button>
                        <button
                            className={`${styles.btn} ${styles.btnSecondaryOutline}`}
                            onClick={() =>
                                router.push(
                                    `/account/transfer-proof/${reg.registration_id}`,
                                )
                            }
                            disabled={isActionDisabled}
                        >
                            <MoneyIcon /> {t("transferProof.page.title")}
                        </button>
                        <button
                            className={`${styles.btn} ${styles.btnSecondaryOutline}`}
                            onClick={() =>
                                router.push(
                                    `/account/prodi/${reg.registration_id}`,
                                )
                            }
                            disabled={isActionDisabled}
                        >
                            <EditIcon /> {t("changeProdi")}
                        </button>
                        <a
                            href="/docs/panduan/pengunduran.pdf"
                            download="pengunduran.pdf"
                            className={`${styles.btn} ${styles.btnDangerOutline}`}
                            style={{ textDecoration: "none" }}
                            aria-disabled={isActionDisabled}
                            onClick={(e) =>
                                isActionDisabled && e.preventDefault()
                            }
                        >
                            <CancelIcon /> {t("resignation")}
                        </a>
                        <button
                            className={`${styles.btn} ${styles.btnSecondaryOutline}`}
                            onClick={() =>
                                router.push(
                                    `/account/prasyarat-ospek/${reg.registration_id}`,
                                )
                            }
                            disabled={isActionDisabled}
                        >
                            <ClipboardIcon /> {t("ospekPrerequisites")}
                        </button>
                    </div>
                )}
            </div>
            <ConfirmDialog {...dialogProps} />
        </section>
    );
}

function EmptyRegistration({ onRegister }: { onRegister: () => void }) {
    const t = useTranslations("account");
    return (
        <section className={`${styles.card} ${styles.cardEmpty}`}>
            <div className={styles.emptyState}>
                <FileIcon className={styles.emptyIcon} />
                <h2 className={styles.emptyTitle}>{t("noRegistration")}</h2>
                <p className={styles.emptyText}>{t("noRegistrationSub")}</p>
                <button
                    className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLg}`}
                    onClick={onRegister}
                >
                    {t("registerNow")}
                </button>
            </div>
        </section>
    );
}

function QuickActions({ isLoggingOut }: { isLoggingOut: boolean }) {
    const router = useRouter();
    const logout = useAuthStore((s) => s.logout);
    const setIsLoggingOut = useAuthStore((s) => s.setIsLoggingOut);
    const t = useTranslations("account");

    const handleLogout = async () => {
        setIsLoggingOut(true);
        const toastId = toast.loading(t("loggingOut"));
        try {
            await api.auth.logout();
            logout();
            toast.success(t("logoutSuccess"), { id: toastId });
            router.push("/login");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : t("logoutError"), {
                id: toastId,
            });
        }
    };

    return (
        <section className={styles.card}>
            <div className={styles.cardHeaderLine}>
                <LightningIcon className={styles.cardHeaderIcon} />
                <h2 className={styles.cardTitle}>{t("quickActions")}</h2>
            </div>
            <div className={styles.actionsList}>
                <button
                    className={`${styles.btn} ${styles.btnSecondaryOutline}`}
                    onClick={() => router.push("/account/change-password")}
                    disabled={isLoggingOut}
                >
                    <LockIcon /> {t("quickChangePassword")}
                </button>
                <button
                    className={`${styles.btn} ${styles.btnSecondaryOutline} ${styles.btnFull}`}
                    onClick={() => router.push("/account/update-profile")}
                    disabled={isLoggingOut}
                >
                    <ProfileIcon /> {t("quickUpdateProfile")}
                </button>
                <button
                    className={`${styles.btn} ${styles.btnDangerOutline} ${styles.btnFull}`}
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    aria-busy={isLoggingOut}
                >
                    <LogoutIcon /> {t("logout")}
                </button>
            </div>
        </section>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Account() {
    const router = useRouter();
    const t = useTranslations("account");
    const { user, isLoggingOut } = useAuthStore();
    const [profile, setProfile] = useState<{
        user: User;
        registrations: RegistrationCard[];
    } | null>(null);
    const [isFetching, setIsFetching] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        if (!user) return;

        const loadProfile = async () => {
            setIsFetching(true);
            try {
                const data = await api.profile.get();
                setProfile({
                    user: {
                        full_name: data.full_name,
                        nik: data.nik,
                        email: data.email,
                        email_verified: data.email_verified,
                    },
                    registrations: data.registrations || [],
                });
                const current = useAuthStore.getState().user;
                if (
                    current &&
                    (current.full_name !== data.full_name ||
                        current.email !== data.email)
                ) {
                    useAuthStore.getState().setUser({
                        ...current,
                        full_name: data.full_name,
                        email: data.email,
                        email_verified: data.email_verified,
                    });
                }
            } catch (err) {
                toast.error(
                    err instanceof Error ? err.message : t("loadProfileError"),
                );
            } finally {
                setIsFetching(false);
            }
        };

        loadProfile();
    }, [t, user, refreshKey]);

    const handleMutate = () => {
        setRefreshKey((k) => k + 1);
    };

    if (isFetching) return <AccountSkeleton />;
    if (!profile) return null;

    const hasRegistrations = profile.registrations.length > 0;

    return (
        <section className={styles.account}>
            <ProfileHero user={profile.user} />

            <main className={styles.accountContent}>
                <div className={styles.layoutGrid}>
                    <div className={styles.mainColumn}>
                        {hasRegistrations ? (
                            profile.registrations.map((reg) => (
                                <RegistrationCardItem
                                    key={reg.registration_id}
                                    reg={reg}
                                    onMutate={handleMutate}
                                />
                            ))
                        ) : (
                            <EmptyRegistration
                                onRegister={() => router.push("/#gelombang")}
                            />
                        )}
                    </div>

                    <aside className={styles.sideColumn}>
                        <AccountDetails user={profile.user} />
                        <QuickActions isLoggingOut={isLoggingOut} />
                    </aside>
                </div>
            </main>
        </section>
    );
}
