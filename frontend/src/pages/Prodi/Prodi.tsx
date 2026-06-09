"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/api";
import ConfirmDialog from "@/components/ConfirmDialog/ConfirmDialog";
import { useConfirm } from "@/components/ConfirmDialog/useConfirm";
import {
    CheckIcon,
    ClockIcon,
    FileIcon,
    TrashIcon,
    WarningIcon,
} from "@/components/Icons/Icons";
import type {
    ProdiInfoResponse,
    ProdiRequestItem,
    ProgramChoice,
} from "@/types/api";
import ProdiSkeleton from "./Prodi.skeleton";
import styles from "./Prodi.module.scss";

interface ProdiProps {
    regID: string;
}

function StatusBadge({
    status,
    t,
}: {
    status: ProdiRequestItem["status"];
    t: (key: string, opts?: Record<string, string | number | Date>) => string;
}) {
    const config = {
        PENDING: {
            label: t("statusPending"),
            color: "pending",
            icon: <ClockIcon className={styles.statusIconSvg} />,
        },
        APPROVED: {
            label: t("statusApproved"),
            color: "approved",
            icon: <CheckIcon className={styles.statusIconSvg} />,
        },
        REJECTED: {
            label: t("statusRejected"),
            color: "rejected",
            icon: <WarningIcon className={styles.statusIconSvg} />,
        },
    };
    const c = config[status as keyof typeof config];
    return (
        <span className={styles.statusBadge} data-status={c.color}>
            {c.icon}
            {c.label}
        </span>
    );
}

export default function Prodi({ regID }: ProdiProps) {
    const router = useRouter();
    const locale = useLocale();
    const t = useTranslations("prodi");
    const shiftLabel = useCallback(
        (shift: string) =>
            shift === "PAGI" ? t("shiftMorning") : t("shiftEvening"),
        [t],
    );
    const shiftOptions = [
        { value: "PAGI", label: t("shiftMorning") },
        { value: "MALAM", label: t("shiftEvening") },
    ];

    const [data, setData] = useState<ProdiInfoResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCancelling, setIsCancelling] = useState<string | null>(null);
    const [newProdi, setNewProdi] = useState("");
    const [newShift, setNewShift] = useState("");

    const { confirm, dialogProps, setLoading } = useConfirm();

    const hasPending = useMemo(
        () => data?.requests.some((r) => r.status === "PENDING") ?? false,
        [data],
    );

    const refresh = async () => {
        setIsLoading(true);
        try {
            const res = await api.prodi.get(regID, locale);
            setData(res);
            setNewProdi("");
            setNewShift("");
        } catch (err) {
            toast.error(
                err instanceof Error ? err.message : t("toastLoadError"),
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        let active = true;

        async function init() {
            setIsLoading(true);
            try {
                const res = await api.prodi.get(regID, locale);
                if (!active) return;
                setData(res);
                setNewProdi("");
                setNewShift("");
            } catch (err) {
                if (!active) return;
                toast.error(
                    err instanceof Error ? err.message : t("toastLoadError"),
                );
            } finally {
                if (active) setIsLoading(false);
            }
        }

        init();

        return () => {
            active = false;
        };
    }, [regID, locale, t]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProdi || !newShift) {
            toast.error(t("toastFillFields"));
            return;
        }
        if (
            newProdi === data?.current_prodi &&
            newShift === data?.current_shift
        ) {
            toast.error(t("toastNoChange"));
            return;
        }

        setIsSubmitting(true);
        const toastId = toast.loading(t("toastSubmitting"));
        try {
            await api.prodi.post(regID, newProdi, newShift, locale);
            toast.success(t("toastSubmitSuccess"), { id: toastId });
            await refresh();
        } catch (err) {
            toast.error(
                err instanceof Error ? err.message : t("toastSubmitError"),
                { id: toastId },
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = async (requestId: string) => {
        const confirmed = await confirm({
            title: t("cancelDialogTitle"),
            message: t("cancelDialogMessage"),
            confirmLabel: t("cancelDialogConfirm"),
            cancelLabel: t("cancelDialogDeny"),
            variant: "danger",
        });
        if (!confirmed) return;

        setIsCancelling(requestId);
        setLoading(true);
        const toastId = toast.loading(t("toastCancelling"));
        try {
            await api.prodi.delete(regID, requestId, locale);
            toast.success(t("toastCancelSuccess"), { id: toastId });
            await refresh();
        } catch (err) {
            toast.error(
                err instanceof Error ? err.message : t("toastCancelError"),
                { id: toastId },
            );
        } finally {
            setIsCancelling(null);
            setLoading(false);
        }
    };

    if (isLoading) return <ProdiSkeleton />;
    if (!data) return null;

    return (
        <section className={styles.prodi}>
            <div className={styles.prodiContent}>
                <div className={styles.pageHeader}>
                    <button
                        type="button"
                        className={styles.backLink}
                        onClick={() => router.push("/account")}
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        {t("backToAccount")}
                    </button>
                </div>

                <div className={styles.layoutGrid}>
                    <div className={styles.mainColumn}>
                        <div className={styles.card}>
                            <div className={styles.cardHeader}>
                                <ClockIcon className={styles.cardHeaderIcon} />
                                <h2 className={styles.cardTitle}>
                                    {t("requestHistory")}
                                </h2>
                            </div>

                            {data.requests.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <FileIcon className={styles.emptyIcon} />
                                    <h3 className={styles.emptyTitle}>
                                        {t("emptyTitle")}
                                    </h3>
                                    <p className={styles.emptyText}>
                                        {t("emptyText")}
                                    </p>
                                </div>
                            ) : (
                                <div className={styles.historyList}>
                                    {data.requests.map((req) => (
                                        <div
                                            key={req.id}
                                            className={styles.historyItem}
                                        >
                                            <div className={styles.itemHeader}>
                                                <div
                                                    className={styles.itemDate}
                                                >
                                                    <span
                                                        className={
                                                            styles.dateDay
                                                        }
                                                    >
                                                        {new Date(
                                                            req.request_date,
                                                        ).getDate()}
                                                    </span>
                                                    <span
                                                        className={
                                                            styles.dateMonth
                                                        }
                                                    >
                                                        {new Date(
                                                            req.request_date,
                                                        ).toLocaleDateString(
                                                            "id-ID",
                                                            {
                                                                month: "short",
                                                            },
                                                        )}
                                                    </span>
                                                    <span
                                                        className={
                                                            styles.dateYear
                                                        }
                                                    >
                                                        {new Date(
                                                            req.request_date,
                                                        ).getFullYear()}
                                                    </span>
                                                </div>

                                                <div
                                                    className={
                                                        styles.itemControls
                                                    }
                                                >
                                                    <StatusBadge
                                                        status={
                                                            req.status as ProdiRequestItem["status"]
                                                        }
                                                        t={t}
                                                    />
                                                    {req.status ===
                                                        "PENDING" && (
                                                            <button
                                                                type="button"
                                                                className={`${styles.btnIcon} ${styles.btnIconDanger}`}
                                                                onClick={() =>
                                                                    handleCancel(
                                                                        req.id,
                                                                    )
                                                                }
                                                                disabled={
                                                                    isCancelling ===
                                                                    req.id
                                                                }
                                                                aria-label={t(
                                                                    "cancelRequest",
                                                                )}
                                                                title={t(
                                                                    "cancelRequest",
                                                                )}
                                                            >
                                                                <TrashIcon />
                                                            </button>
                                                        )}
                                                </div>
                                            </div>

                                            <div className={styles.itemRoute}>
                                                <div
                                                    className={
                                                        styles.routeOrigin
                                                    }
                                                >
                                                    <span
                                                        className={
                                                            styles.routeLabel
                                                        }
                                                    >
                                                        {t("routeFrom")}
                                                    </span>
                                                    <span
                                                        className={
                                                            styles.routeValue
                                                        }
                                                    >
                                                        {req.previous_prodi}{" "}
                                                        <span
                                                            className={
                                                                styles.routeShift
                                                            }
                                                        >
                                                            (
                                                            {shiftLabel(
                                                                req.previous_shift,
                                                            )}
                                                            )
                                                        </span>
                                                    </span>
                                                </div>

                                                <svg
                                                    width="14"
                                                    height="14"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className={
                                                        styles.routeArrow
                                                    }
                                                >
                                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                                </svg>

                                                <div
                                                    className={
                                                        styles.routeTarget
                                                    }
                                                >
                                                    <span
                                                        className={
                                                            styles.routeLabel
                                                        }
                                                    >
                                                        {t("routeTo")}
                                                    </span>
                                                    <span
                                                        className={
                                                            styles.routeValue
                                                        }
                                                    >
                                                        {req.new_prodi}{" "}
                                                        <span
                                                            className={
                                                                styles.routeShift
                                                            }
                                                        >
                                                            (
                                                            {shiftLabel(
                                                                req.new_shift,
                                                            )}
                                                            )
                                                        </span>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className={styles.card}>
                            <div className={styles.cardHeader}>
                                <FileIcon className={styles.cardHeaderIcon} />
                                <h2 className={styles.cardTitle}>
                                    {t("formTitle")}
                                </h2>
                            </div>

                            {hasPending ? (
                                <div className={styles.warningBlock}>
                                    <WarningIcon />
                                    <div>
                                        <div className={styles.warningTitle}>
                                            {t("pendingWarningTitle")}
                                        </div>
                                        <p className={styles.warningText}>
                                            {t("pendingWarningText")}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    <div className={styles.formGrid}>
                                        <div className={styles.formGroup}>
                                            <label className={styles.formLabel}>
                                                {t("currentProgram")}
                                            </label>
                                            <div
                                                className={styles.readOnlyValue}
                                            >
                                                {data.current_prodi}
                                            </div>
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label className={styles.formLabel}>
                                                {t("currentSchedule")}
                                            </label>
                                            <div
                                                className={styles.readOnlyValue}
                                            >
                                                {shiftLabel(data.current_shift)}
                                            </div>
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label
                                                className={styles.formLabel}
                                                htmlFor="newProdi"
                                            >
                                                {t("newProgram")}
                                            </label>
                                            <select
                                                id="newProdi"
                                                className={styles.select}
                                                value={newProdi}
                                                onChange={(e) =>
                                                    setNewProdi(e.target.value)
                                                }
                                                required
                                            >
                                                <option value="">
                                                    {t("selectProgram")}
                                                </option>
                                                {data.available_programs.map(
                                                    (opt: ProgramChoice) => (
                                                        <option
                                                            key={opt.code}
                                                            value={opt.code}
                                                        >
                                                            {opt.title}
                                                        </option>
                                                    ),
                                                )}
                                            </select>
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label
                                                className={styles.formLabel}
                                                htmlFor="newShift"
                                            >
                                                {t("newSchedule")}
                                            </label>
                                            <select
                                                id="newShift"
                                                className={styles.select}
                                                value={newShift}
                                                onChange={(e) =>
                                                    setNewShift(e.target.value)
                                                }
                                                required
                                            >
                                                <option value="">
                                                    {t("selectSchedule")}
                                                </option>
                                                {shiftOptions.map((opt) => (
                                                    <option
                                                        key={opt.value}
                                                        value={opt.value}
                                                    >
                                                        {opt.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className={styles.formActions}>
                                        <button
                                            type="button"
                                            className={`${styles.btn} ${styles.btnSecondaryOutline}`}
                                            onClick={() =>
                                                router.push("/account")
                                            }
                                            disabled={isSubmitting}
                                        >
                                            {t("cancel")}
                                        </button>
                                        <button
                                            type="submit"
                                            className={`${styles.btn} ${styles.btnPrimary}`}
                                            disabled={isSubmitting}
                                        >
                                            {t("submit")}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>

                    <aside className={styles.sideColumn}>
                        <div className={styles.card}>
                            <div className={styles.cardHeader}>
                                <FileIcon className={styles.cardHeaderIcon} />
                                <h2 className={styles.cardTitle}>
                                    {t("infoTitle")}
                                </h2>
                            </div>
                            <div className={styles.detailsGrid}>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>
                                        {t("infoBatch")}
                                    </span>
                                    <span className={styles.infoValue}>
                                        {data.batch_name}
                                    </span>
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>
                                        {t("infoAcademicYear")}
                                    </span>
                                    <span className={styles.infoValue}>
                                        {data.academic_year}/
                                        {Number(data.academic_year) + 1}
                                    </span>
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>
                                        {t("infoCurrentProgram")}
                                    </span>
                                    <span className={styles.infoValue}>
                                        {data.current_prodi}
                                    </span>
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>
                                        {t("infoCurrentSchedule")}
                                    </span>
                                    <span className={styles.infoValue}>
                                        {shiftLabel(data.current_shift)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            <ConfirmDialog {...dialogProps} />
        </section>
    );
}
