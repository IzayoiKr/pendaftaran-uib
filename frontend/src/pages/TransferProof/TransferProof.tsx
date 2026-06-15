"use client";

import {
    useEffect,
    useMemo,
    useRef,
    useState,
    useCallback,
    type ChangeEvent,
    type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { api } from "@/api";
import { UPLOAD_CONSTRAINTS } from "@/pages/Registration/registerOptions";
import useAuthStore from "@/store/useAuthStore";
import styles from "./TransferProof.module.scss";

// ─── Types ──────────────────────────────────────────────────────────────────

interface BiodataPendaftaran {
    nomorDaftar: string;
    periode: string;
    gelombang: string;
    jurusan: string;
    waktuKuliah: string;
}

interface BuktiTransferRow {
    tanggalUpload: string;
    pemilikRekening: string;
    bank: string;
    buktiTransferUrl: string;
    statusValidasi: string;
    ropUrl: string;
}

interface TambahBuktiTransferForm {
    pemilikRekening: string;
    bank: string;
    file: File | null;
}

// ─── Inline SVG Icons ────────────────────────────────────────────────────────

function CheckIcon({ className }: { className?: string }) {
    return (
        <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );
}

function ClockIcon({ className }: { className?: string }) {
    return (
        <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    );
}

function XIcon({ className }: { className?: string }) {
    return (
        <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    );
}

function UploadCloudIcon({ className }: { className?: string }) {
    return (
        <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
            <path d="M12 12v9" />
            <path d="m16 16-4-4-4 4" />
        </svg>
    );
}

function ArrowLeftIcon({ className }: { className?: string }) {
    return (
        <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
        </svg>
    );
}

function FileTextIcon({ className }: { className?: string }) {
    return (
        <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
            <path d="M14 2v4a2 2 0 0 0 2 2h4" />
            <path d="M10 9H8" />
            <path d="M16 13H8" />
            <path d="M16 17H8" />
        </svg>
    );
}

function SearchIcon({ className }: { className?: string }) {
    return (
        <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
        </svg>
    );
}

function DownloadIcon({ className }: { className?: string }) {
    return (
        <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" x2="12" y1="15" y2="3" />
        </svg>
    );
}

function CreditCardIcon({ className }: { className?: string }) {
    return (
        <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="14" x="2" y="5" rx="2" />
            <line x1="2" x2="22" y1="10" y2="10" />
        </svg>
    );
}

function TrashIcon({ className }: { className?: string }) {
    return (
        <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        </svg>
    );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
    const normalized = status.toLowerCase();
    let variant: "accepted" | "pending" | "rejected" = "pending";
    if (
        normalized.includes("lunas") ||
        normalized.includes("verified") ||
        normalized.includes("diterima")
    ) {
        variant = "accepted";
    } else if (
        normalized.includes("rejected") ||
        normalized.includes("ditolak")
    ) {
        variant = "rejected";
    }

    const icons = {
        accepted: <CheckIcon className={styles.badgeIcon} />,
        pending: <ClockIcon className={styles.badgeIcon} />,
        rejected: <XIcon className={styles.badgeIcon} />,
    };

    return (
        <span className={styles.statusBadge} data-status={variant}>
            {icons[variant]}
            {status}
        </span>
    );
}

function PageHeader({ status }: { status: "accepted" | "pending" | "rejected" }) {
    const t = useTranslations("account.transferProof");
    const config = {
        accepted: { label: t("status.accepted"), color: "accepted" as const },
        rejected: { label: t("status.rejected"), color: "rejected" as const },
    };
    const c = status !== "pending" ? config[status] : undefined;

    return (
        <div className={styles.pageHeader}>
            <div className={styles.pageHeaderText}>
                <div className={styles.pageHeaderMeta}>
                    <span className={styles.pageTag}>{t("page.tag")}</span>
                </div>
                <h1 className={styles.pageTitle}>{t("page.title")}</h1>
                <p className={styles.pageSubtitle}>
                    {t("page.subtitle")}
                </p>
            </div>
            {c && (
                <div className={styles.pageHeaderBadges}>
                    <span className={styles.statusBadge} data-status={c.color}>
                        {c.label}
                    </span>
                </div>
            )}
        </div>
    );
}

function StatsCards({ rows }: { rows: BuktiTransferRow[] }) {
    const t = useTranslations("account.transferProof");
    const stats = useMemo(() => {
        const total = rows.length;
        const accepted = rows.filter((r) => {
            const s = r.statusValidasi.toLowerCase();
            return (
                s.includes("lunas") ||
                s.includes("verified") ||
                s.includes("diterima")
            );
        }).length;
        const pending = rows.filter((r) => {
            const s = r.statusValidasi.toLowerCase();
            return (
                !s.includes("lunas") &&
                !s.includes("verified") &&
                !s.includes("diterima") &&
                !s.includes("rejected") &&
                !s.includes("ditolak")
            );
        }).length;
        return { total, accepted, pending };
    }, [rows]);

    if (rows.length === 0) return null;

    return (
        <div className={styles.statsGrid}>
            <div className={styles.statCard}>
                <div className={styles.statIconWrap}>
                    <FileTextIcon className={styles.statIcon} />
                </div>
                <span className={styles.statValue}>{stats.total}</span>
                <span className={styles.statLabel}>{t("stats.total")}</span>
            </div>
            <div className={`${styles.statCard} ${styles.statCardSuccess}`}>
                <div className={`${styles.statIconWrap} ${styles.statIconWrapSuccess}`}>
                    <CheckIcon className={styles.statIcon} />
                </div>
                <span className={styles.statValue}>{stats.accepted}</span>
                <span className={styles.statLabel}>{t("stats.accepted")}</span>
            </div>
            <div className={`${styles.statCard} ${styles.statCardWarning}`}>
                <div className={`${styles.statIconWrap} ${styles.statIconWrapWarning}`}>
                    <ClockIcon className={styles.statIcon} />
                </div>
                <span className={styles.statValue}>{stats.pending}</span>
                <span className={styles.statLabel}>{t("stats.pending")}</span>
            </div>
        </div>
    );
}

function Timeline({ rows }: { rows: BuktiTransferRow[] }) {
    const t = useTranslations("account.transferProof");
    if (rows.length === 0) return null;

    const hasVerified = rows.some((r) => {
        const s = r.statusValidasi.toLowerCase();
        return (
            s.includes("lunas") || s.includes("verified") || s.includes("diterima")
        );
    });
    const isUnderVerification = !hasVerified && rows.length > 0;

    const steps = [
        {
            label: t("timeline.receiptUploaded"),
            sub: t("timeline.receiptUploadedSub"),
            done: true,
            active: false,
        },
        {
            label: t("timeline.underVerification"),
            sub: t("timeline.underVerificationSub"),
            done: isUnderVerification || hasVerified,
            active: isUnderVerification,
        },
        {
            label: t("timeline.verified"),
            sub: t("timeline.verifiedSub"),
            done: hasVerified,
            active: false,
        },
    ];

    return (
        <section className={styles.card}>
            <div className={styles.cardHeaderLine}>
                <span className={styles.cardHeaderIcon}>⏱</span>
                <h2 className={styles.cardTitle}>{t("timeline.title")}</h2>
            </div>
            <div className={styles.timeline}>
                {steps.map((step, i) => (
                    <div
                        key={i}
                        className={`${styles.timelineStep} ${
                            step.done ? styles.timelineDone : ""
                        } ${step.active ? styles.timelineActive : ""}`}
                    >
                        <div className={styles.timelineDot}>
                            {step.done && <CheckIcon className={styles.timelineCheck} />}
                        </div>
                        <div className={styles.timelineContent}>
                            <span className={styles.timelineLabel}>
                                {step.label}
                            </span>
                            <span className={styles.timelineSub}>
                                {step.sub}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

const TABLE_HEADERS = [
    "date",
    "owner",
    "bank",
    "proof",
    "status",
    "action",
];

function BuktiTransferTable({ rows: initialRows }: { rows: BuktiTransferRow[] }) {
    const t = useTranslations("account.transferProof");
    const tCommon = useTranslations("common");
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");

    const rows = useMemo(() => {
        let result = initialRows;
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(
                (r) =>
                    r.pemilikRekening.toLowerCase().includes(q) ||
                    r.bank.toLowerCase().includes(q) ||
                    r.statusValidasi.toLowerCase().includes(q) ||
                    r.tanggalUpload.toLowerCase().includes(q),
            );
        }
        if (filter !== "all") {
            result = result.filter((r) => {
                const s = r.statusValidasi.toLowerCase();
                if (filter === "accepted")
                    return (
                        s.includes("lunas") ||
                        s.includes("verified") ||
                        s.includes("diterima")
                    );
                if (filter === "pending")
                    return (
                        !s.includes("lunas") &&
                        !s.includes("verified") &&
                        !s.includes("diterima") &&
                        !s.includes("rejected") &&
                        !s.includes("ditolak")
                    );
                if (filter === "rejected")
                    return s.includes("rejected") || s.includes("ditolak");
                return true;
            });
        }
        return result;
    }, [initialRows, search, filter]);

    const handleDownload = async (url: string) => {
        try {
            toast.loading(tCommon("loading"), { id: url });
            const blob = await api.storage.getFileBlob(url);
            const objectUrl = window.URL.createObjectURL(blob);
            window.open(objectUrl, "_blank");
            setTimeout(() => window.URL.revokeObjectURL(objectUrl), 60000);
            toast.success(tCommon("success"), { id: url });
        } catch (err) {
            console.error("Download error", err);
            toast.error(tCommon("serverError"), { id: url });
        }
    };

    return (
        <section className={styles.card}>
            <div className={styles.cardHeaderLine}>
                <span className={styles.cardHeaderIcon}>🧾</span>
                <h2 className={styles.cardTitle}>{t("table.title")}</h2>
                <span className={styles.badgeCount}>{rows.length} {t("table.entries")}</span>
            </div>

            <div className={styles.tableToolbar}>
                <div className={styles.searchWrap}>
                    <SearchIcon className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder={t("table.searchPlaceholder")}
                        className={styles.searchInput}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <select
                    className={styles.filterSelect}
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                >
                    <option value="all">{t("table.filter.all")}</option>
                    <option value="accepted">{t("table.filter.accepted")}</option>
                    <option value="pending">{t("table.filter.pending")}</option>
                    <option value="rejected">{t("table.filter.rejected")}</option>
                </select>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.modernTable}>
                    <thead>
                        <tr>
                            {TABLE_HEADERS.map((h) => (
                                <th key={h}>{t(`table.headers.${h}`)}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={TABLE_HEADERS.length}
                                    className={styles.emptyCell}
                                >
                                    <div className={styles.emptyState}>
                                        <div className={styles.emptyVisual}>
                                            <UploadCloudIcon className={styles.emptyIconSvg} />
                                        </div>
                                        <h3 className={styles.emptyTitle}>
                                            {t("table.empty.title")}
                                        </h3>
                                        <p className={styles.emptyText}>
                                            {t("table.empty.description")}
                                        </p>
                                    </div>
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
                                                onClick={() => handleDownload(row.buktiTransferUrl)}
                                                className={styles.btnReceipt}
                                            >
                                                <FileTextIcon />
                                                {t("table.btn.viewProof")}
                                            </button>
                                        ) : (
                                            "-"
                                        )}
                                    </td>
                                    <td>
                                        <StatusBadge
                                            status={row.statusValidasi}
                                        />
                                    </td>
                                    <td>
                                        {row.statusValidasi
                                            .toLowerCase()
                                            .includes("lunas") ||
                                        row.statusValidasi
                                            .toLowerCase()
                                            .includes("verified") ? (
                                            <button
                                                type="button"
                                                onClick={() => handleDownload(row.ropUrl)}
                                                className={styles.btnRop}
                                            >
                                                <CreditCardIcon />
                                                {t("table.btn.viewRop")}
                                            </button>
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
        </section>
    );
}

function FormTextInput({
    id,
    label,
    placeholder,
    value,
    autoComplete,
    onChange,
}: {
    id: string;
    label: string;
    placeholder: string;
    value: string;
    autoComplete?: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
    return (
        <div className={styles.formField}>
            <label htmlFor={id}>
                {label}
                <span className={styles.requiredStar}> *</span>
            </label>
            <input
                id={id}
                type="text"
                placeholder={`${placeholder}*`}
                value={value}
                autoComplete={autoComplete}
                onChange={onChange}
                required
            />
        </div>
    );
}

// ─── Modern Upload Zone (UploadZone-style) ────────────────────────────────────

function UploadZone({
    file,
    onFileChange,
}: {
    file: File | null;
    onFileChange: (file: File | null) => void;
}) {
    const t = useTranslations("account.transferProof");
    const [isDragOver, setIsDragOver] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const zoneRef = useRef<HTMLDivElement>(null);

    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

    const handleInputChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            const f = e.target.files?.[0] ?? null;
            if (f) {
                if (f.size > MAX_FILE_SIZE) {
                    toast.error(t("toast.maxFileSize"));
                    e.target.value = "";
                    return;
                }
                if (!UPLOAD_CONSTRAINTS.acceptedTypes.includes(f.type as any)) {
                    toast.error(t("toast.invalidFileType"));
                    e.target.value = "";
                    return;
                }
            }
            onFileChange(f);
            e.target.value = "";
        },
        [onFileChange, t],
    );

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();
            if (
                zoneRef.current &&
                !zoneRef.current.contains(e.relatedTarget as Node)
            ) {
                setIsDragOver(false);
            }
        },
        [],
    );

    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragOver(false);
            const f = e.dataTransfer.files?.[0] ?? null;
            if (f) {
                if (f.size > MAX_FILE_SIZE) {
                    toast.error(t("toast.maxFileSize"));
                    return;
                }
                if (!UPLOAD_CONSTRAINTS.acceptedTypes.includes(f.type as any)) {
                    toast.error(t("toast.invalidFileType"));
                    return;
                }

            }
            if (f) onFileChange(f);
        },
        [onFileChange, t],
    );

    const handleRemove = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            onFileChange(null);
            if (inputRef.current) inputRef.current.value = "";
        },
        [onFileChange],
    );

    const openPicker = useCallback(() => {
        inputRef.current?.click();
    }, []);

    const zoneClasses = [
        styles.uploadZone,
        isDragOver ? styles.dragover : "",
        file ? styles.success : "",
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div className={styles.formField}>
            <label>
                {t("form.fields.proof")}
                <span className={styles.requiredStar}> *</span>
            </label>

            <div
                ref={zoneRef}
                className={zoneClasses}
                onClick={openPicker}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openPicker();
                    }
                }}
            >
                {file ? (
                    <div className={styles.uploadPreview}>
                        <FileTextIcon />
                        <div className={styles.fileInfo}>
                            <span className={styles.fileName}>
                                {file.name}
                            </span>
                            <span className={styles.fileSize}>
                                {formatSize(file.size)}
                            </span>
                        </div>
                        <div className={styles.uploadActions}>
                            <button
                                type="button"
                                className={styles.removeBtn}
                                onClick={handleRemove}
                                aria-label={t("form.upload.removeAria")}
                                title={t("form.upload.removeAria")}
                            >
                                <TrashIcon />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className={styles.uploadPlaceholder}>
                        <span className={styles.uploadIcon}>
                            <UploadCloudIcon />
                        </span>
                        <span className={styles.uploadMainText}>
                            {t("form.upload.placeholder")}
                        </span>
                        <span className={styles.uploadHint}>
                            {t("form.upload.hint")}
                        </span>
                    </div>
                )}
            </div>

            <input
                ref={inputRef}
                type="file"
                accept={UPLOAD_CONSTRAINTS.acceptedExtensions}
                style={{ display: "none" }}
                onChange={handleInputChange}
                tabIndex={-1}
                aria-hidden="true"
            />
        </div>
    );
}

function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Right Sidebar: Registration Info + Download VA ───────────────────────────

function RegistrationInfoCard({ data }: { data: BiodataPendaftaran }) {
    const t = useTranslations("account.transferProof");
    return (
        <div className={`${styles.card} ${styles.cardGlass}`}>
            <div className={styles.cardHeaderLine}>
                <span className={styles.cardHeaderIcon}>📋</span>
                <h2 className={styles.cardTitle}>{t("sidebar.title")}</h2>
            </div>
            <div className={styles.sideInfoList}>
                <div className={styles.sideInfoItem}>
                    <span className={styles.sideInfoLabel}>{t("sidebar.gelombang")}</span>
                    <span className={styles.sideInfoValue}>
                        {data.gelombang || "-"}
                    </span>
                </div>
                <div className={styles.sideInfoItem}>
                    <span className={styles.sideInfoLabel}>{t("sidebar.periode")}</span>
                    <span className={styles.sideInfoValue}>
                        {data.periode || "-"}
                    </span>
                </div>
                <div className={styles.sideInfoItem}>
                    <span className={styles.sideInfoLabel}>{t("sidebar.prodi")}</span>
                    <span className={styles.sideInfoValue}>
                        {data.jurusan || "-"}
                    </span>
                </div>
                <div className={styles.sideInfoItem}>
                    <span className={styles.sideInfoLabel}>{t("sidebar.waktuKuliah")}</span>
                    <span className={styles.sideInfoValue}>
                        {data.waktuKuliah || "-"}
                    </span>
                </div>
                <div className={styles.sideInfoDivider} />
                <a
                    href="/docs/panduan/VA.pdf"
                    download="Panduan_Pembayaran_VA.pdf"
                    className={styles.vaDownloadLink}
                >
                    <span className={styles.vaDownloadIcon}>
                        <DownloadIcon />
                    </span>
                    <div className={styles.vaDownloadText}>
                        <span className={styles.vaDownloadTitle}>
                            {t("sidebar.vaTitle")}
                        </span>
                        <span className={styles.vaDownloadDesc}>
                            {t("sidebar.vaDesc")}
                        </span>
                    </div>
                </a>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TransferProof({ regID }: { regID: string }) {
    const t = useTranslations("account.transferProof");
    const tCommon = useTranslations("common");
    const locale = useLocale();
    const router = useRouter();
    const { accessToken } = useAuthStore();

    const [biodata, setBiodata] = useState<BiodataPendaftaran>({
        nomorDaftar: regID,
        periode: "",
        gelombang: "",
        jurusan: "",
        waktuKuliah: "",
    });
    const [rows, setRows] = useState<BuktiTransferRow[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const [form, setForm] = useState<TambahBuktiTransferForm>({
        pemilikRekening: "",
        bank: "",
        file: null,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!regID) return;

        const fetchData = async () => {
            setIsLoading(true);
            try {
                const data = await api.transfer.get(regID);
                if (data && data.registration) {
                    const reg = data.registration;
                    setBiodata({
                        nomorDaftar: regID,
                        periode: data.registration.academic_year || new Date().getFullYear().toString(),
                        gelombang: reg.batch_name || "-",
                        jurusan: data.current_prodi || "-",
                        waktuKuliah: data.current_session || "-",
                    });

                    if (data.payments && Array.isArray(data.payments)) {
                        const mappedRows: BuktiTransferRow[] =
                            data.payments.map((p) => ({
                                tanggalUpload: p.created_at
                                    ? new Date(
                                          p.created_at,
                                      ).toLocaleDateString(locale, {
                                          day: "2-digit",
                                          month: "short",
                                          year: "numeric",
                                      })
                                    : "-",
                                pemilikRekening: p.pemilik_rekening || "-",
                                bank: p.bank || "-",
                                buktiTransferUrl: `/api/storage/${p.bukti_bayar_path}`,
                                statusValidasi:
                                    p.status || "Masih dalam pemeriksaan",
                                ropUrl: `/api/registration/${regID}/rop/${p.id}`,
                            }));
                        setRows(mappedRows);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch registration details", err);
                toast.error(t("toast.fetchError"));
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [regID, refreshKey, locale, t, accessToken]);

    const handleTextChange =
        (
            field: keyof Pick<
                TambahBuktiTransferForm,
                "pemilikRekening" | "bank"
            >,
        ) =>
        (e: ChangeEvent<HTMLInputElement>) =>
            setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!regID) {
            toast.error(t("toast.noRegNumber"));
            return;
        }
        if (!form.file) {
            toast.error(t("toast.noFile"));
            return;
        }
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("pemilikRekening", form.pemilikRekening);
            formData.append("bank", form.bank);
            formData.append("file", form.file);
            await api.transfer.uploadBukti(regID, formData);
            toast.success(t("toast.uploadSuccess"));
            setForm({ pemilikRekening: "", bank: "", file: null });
            setRefreshKey((k) => k + 1);
        } catch (err: any) {
            const message =
                err.message && err.message.startsWith("common.")
                    ? tCommon(err.message.split(".")[1] as any)
                    : err.message || t("toast.uploadError");
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const overallStatus = useMemo(() => {
        if (rows.length === 0) return "pending";
        const allAccepted = rows.every((r) => {
            const s = r.statusValidasi.toLowerCase();
            return (
                s.includes("lunas") ||
                s.includes("verified") ||
                s.includes("diterima")
            );
        });
        if (allAccepted) return "accepted";
        const anyRejected = rows.some((r) => {
            const s = r.statusValidasi.toLowerCase();
            return s.includes("rejected") || s.includes("ditolak");
        });
        if (anyRejected) return "rejected";
        return "pending";
    }, [rows]);

    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <PageHeader
                    status={
                        overallStatus as "accepted" | "pending" | "rejected"
                    }
                />

                {isLoading ? (
                    <div className={styles.card}>
                        <p
                            style={{
                                textAlign: "center",
                                padding: "2rem",
                                color: "#64748b",
                            }}
                        >
                            Loading...
                        </p>
                    </div>
                ) : (
                    <div className={styles.layoutGrid}>
                        <div className={styles.mainColumn}>
                            <StatsCards rows={rows} />
                            <Timeline rows={rows} />
                            <BuktiTransferTable rows={rows} />

                            {/* ── Upload Form ─────────────────────────────── */}
                            <section className={styles.card}>
                                <div className={styles.cardHeaderLine}>
                                    <span className={styles.cardHeaderIcon}>
                                        ⬆️
                                    </span>
                                    <h2 className={styles.cardTitle}>
                                        {t("form.title")}
                                    </h2>
                                </div>

                                <form onSubmit={handleSubmit} noValidate>
                                    <div className={styles.fieldGroup}>
                                        <FormTextInput
                                            id="pemilikRekening"
                                            label={t("form.fields.owner")}
                                            placeholder={t("form.fields.owner")}
                                            value={form.pemilikRekening}
                                            autoComplete="name"
                                            onChange={handleTextChange(
                                                "pemilikRekening",
                                            )}
                                        />
                                        <FormTextInput
                                            id="bank"
                                            label={t("form.fields.bank")}
                                            placeholder={t("form.fields.bank")}
                                            value={form.bank}
                                            onChange={handleTextChange("bank")}
                                        />
                                        <UploadZone
                                            file={form.file}
                                            onFileChange={(file) =>
                                                setForm((prev) => ({
                                                    ...prev,
                                                    file,
                                                }))
                                            }
                                        />
                                    </div>
                                    <div className={styles.formActions}>
                                        <button
                                            type="button"
                                            className={`${styles.btn} ${styles.btnGhost}`}
                                            onClick={() => {
                                                setForm({
                                                    pemilikRekening: "",
                                                    bank: "",
                                                    file: null,
                                                });
                                            }}
                                            disabled={isSubmitting}
                                        >
                                            {t("form.btn.reset")}
                                        </button>
                                        <button
                                            type="submit"
                                            className={`${styles.btn} ${styles.btnPrimary}`}
                                            disabled={isSubmitting}
                                            aria-busy={isSubmitting}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <span
                                                        className={
                                                            styles.spinner
                                                        }
                                                        aria-hidden="true"
                                                    />{" "}
                                                    {t("form.btn.uploading")}
                                                </>
                                            ) : (
                                                <>
                                                    <UploadCloudIcon />
                                                    {t("form.btn.upload")}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </section>

                            <div className={styles.pageFooterActions}>
                                <button
                                    className={`${styles.btn} ${styles.btnSecondary}`}
                                    onClick={() => router.back()}
                                >
                                    <ArrowLeftIcon />
                                    {t("form.btn.back")}
                                </button>
                            </div>
                        </div>

                        <aside className={styles.sideColumn}>
                            <RegistrationInfoCard data={biodata} />
                        </aside>
                    </div>
                )}
            </div>
        </main>
    );
}