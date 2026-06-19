"use client";

import {
    type ChangeEvent,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { UPLOAD_CONSTRAINTS } from "@/views/Registration/registerOptions";
import { toast } from "sonner";
import { api } from "@/api";
import styles from "./PrasyaratOspek.module.scss";

// ─── Inline SVG Icons ───────────────────────────────────────────────────────────

function CheckIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );
}

function ClockIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    );
}

function XIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    );
}

function UploadCloudIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
            <path d="M12 12v9" />
            <path d="m16 16-4-4-4 4" />
        </svg>
    );
}

function ArrowLeftIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
        </svg>
    );
}

function FileTextIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
            <path d="M14 2v4a2 2 0 0 0 2 2h4" />
            <path d="M10 9H8" />
            <path d="M16 13H8" />
            <path d="M16 17H8" />
        </svg>
    );
}

function TrashIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        </svg>
    );
}

function DownloadIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" x2="12" y1="15" y2="3" />
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
        normalized.includes("diterima") ||
        normalized.includes("accepted")
    ) {
        variant = "accepted";
    } else if (
        normalized.includes("rejected") ||
        normalized.includes("ditolak")
    ) {
        variant = "rejected";
    }

    const icons = {
        accepted: <CheckIcon />,
        pending: <ClockIcon />,
        rejected: <XIcon />,
    };

    return (
        <span className={styles.statusBadge} data-status={variant}>
            {icons[variant]}
            {status}
        </span>
    );
}

function PageHeader() {
    const t = useTranslations("account.prasyaratOspek");
    return (
        <div className={styles.pageHeader}>
            <div className={styles.pageHeaderText}>
                <div className={styles.pageHeaderMeta}>
                    <span className={styles.pageTag}>{t("page.tag")}</span>
                </div>
                <h1 className={styles.pageTitle}>{t("page.title")}</h1>
                <p className={styles.pageSubtitle}>{t("page.subtitle")}</p>
            </div>
        </div>
    );
}

function StatusCard({ status, notes }: { status: string; notes: string }) {
    const t = useTranslations("account.prasyaratOspek");
    return (
        <section className={styles.card}>
            <div className={styles.cardHeaderLine}>
                <span className={styles.cardHeaderIcon}>📋</span>
                <h2 className={styles.cardTitle}>{t("status.title")}</h2>
                <StatusBadge status={status} />
            </div>
            <div className={styles.notesBox}>
                <span className={styles.notesLabel}>
                    {t("status.notesLabel")}
                </span>
                <p className={styles.notesText}>
                    {notes || t("status.noNotes")}
                </p>
            </div>
        </section>
    );
}

// ─── Upload Zone ──────────────────────────────────────────────────────────────

function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const commonErrorKeys = [
    "invalidFileType",
    "maxFileSize",
    "serverError",
] as const;

type CommonErrorKey = (typeof commonErrorKeys)[number];

function isAcceptedUploadType(type: string): boolean {
    return (UPLOAD_CONSTRAINTS.acceptedTypes as readonly string[]).includes(
        type,
    );
}

function getErrorMessage(err: unknown): string | null {
    return err instanceof Error ? err.message : null;
}

function getCommonErrorKey(message: string): CommonErrorKey | null {
    if (!message.startsWith("common.")) return null;

    const key = message.slice("common.".length);
    return (commonErrorKeys as readonly string[]).includes(key)
        ? (key as CommonErrorKey)
        : null;
}

function UploadZone({
    label,
    file,
    onFileChange,
    exampleHref,
    exampleLabel,
}: {
    label: string;
    file: File | null;
    onFileChange: (file: File | null) => void;
    exampleHref?: string;
    exampleLabel?: string;
}) {
    const t = useTranslations("account.prasyaratOspek");
    const [isDragOver, setIsDragOver] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const zoneRef = useRef<HTMLDivElement>(null);

    const validateFile = useCallback(
        (f: File): string | null => {
            if (f.size > UPLOAD_CONSTRAINTS.maxSizeBytes) {
                return t("upload.maxFileSize");
            }
            if (!isAcceptedUploadType(f.type)) {
                return t("upload.invalidFileType");
            }
            return null;
        },
        [t],
    );

    const handleInputChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            const f = e.target.files?.[0] ?? null;
            if (f) {
                const err = validateFile(f);
                setError(err);
                if (!err) {
                    onFileChange(f);
                } else {
                    onFileChange(null);
                }
            }
            e.target.value = "";
        },
        [onFileChange, validateFile],
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
                const err = validateFile(f);
                setError(err);
                if (!err) {
                    onFileChange(f);
                } else {
                    onFileChange(null);
                }
            }
        },
        [onFileChange, validateFile],
    );

    const handleRemove = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            setError(null);
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
        error ? styles.error : "",
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div className={styles.formField}>
            <label>
                {label}
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
                            <span className={styles.fileName}>{file.name}</span>
                            <span className={styles.fileSize}>
                                {formatSize(file.size)}
                            </span>
                        </div>
                        <div className={styles.uploadActions}>
                            <button
                                type="button"
                                className={styles.removeBtn}
                                onClick={handleRemove}
                                aria-label={t("upload.removeAria")}
                                title={t("upload.removeAria")}
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
                            {t("upload.placeholder")}
                        </span>
                        <span className={styles.uploadHint}>
                            {t("upload.hint")}
                        </span>
                    </div>
                )}
            </div>

            {error && <span className={styles.errorMsg}>{error}</span>}

            <input
                ref={inputRef}
                type="file"
                accept={UPLOAD_CONSTRAINTS.acceptedExtensions}
                style={{ display: "none" }}
                onChange={handleInputChange}
                tabIndex={-1}
                aria-hidden="true"
            />

            {exampleHref && (
                <a href={exampleHref} download className={styles.exampleLink}>
                    <span className={styles.exampleIcon}>
                        <DownloadIcon />
                    </span>
                    <div className={styles.exampleText}>
                        <span className={styles.exampleTitle}>
                            {exampleLabel || t("upload.exampleTitle")}
                        </span>
                        <span className={styles.exampleDesc}>
                            {t("upload.exampleDesc")}
                        </span>
                    </div>
                </a>
            )}
        </div>
    );
}

// ─── Field config ─────────────────────────────────────────────────────────────

const UPLOAD_FIELDS_CONFIG = [
    {
        name: "pasFoto",
        labelKey: "fields.pasFoto",
        exampleHref: "/docs/panduan/contoh_pasphoto.pdf",
        exampleLabelKey: "upload.examplePasFoto",
    },
    {
        name: "ijazah",
        labelKey: "fields.ijazah",
    },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PrasyaratOspek({ regID }: { regID: string }) {
    const t = useTranslations("account.prasyaratOspek");
    const tCommon = useTranslations("common");
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingData, setIsFetchingData] = useState(false);
    const [files, setFiles] = useState<Record<string, File | null>>({
        pasFoto: null,
        ijazah: null,
    });

    const [status, setStatus] = useState("Menunggu Status (Pending)");
    const [catatanPemeriksaan, setCatatanPemeriksaan] = useState("");

    useEffect(() => {
        if (!regID) return;

        const fetchData = async () => {
            setIsFetchingData(true);
            try {
                const data = await api.ospek.get(regID);
                if (data && data.ospek) {
                    if (data.ospek.status) {
                        setStatus(data.ospek.status);
                    }
                    if (data.ospek.notes) {
                        setCatatanPemeriksaan(data.ospek.notes);
                    }
                }
            } catch {
                toast.error(t("toast.fetchError"));
            } finally {
                setIsFetchingData(false);
            }
        };

        fetchData();
    }, [regID, t]);

    const handleFileChange = (name: string, file: File | null) =>
        setFiles((prev) => ({ ...prev, [name]: file }));

    const handleUpload = async () => {
        if (!regID) {
            toast.error(t("toast.noRegNumber"));
            return;
        }

        const missing = UPLOAD_FIELDS_CONFIG.filter((f) => !files[f.name]);
        if (missing.length > 0) {
            const missingLabels = missing.map((f) => t(f.labelKey)).join(", ");
            toast.error(`${t("toast.missingFiles")} ${missingLabels}`);
            return;
        }

        setIsLoading(true);
        try {
            const formData = new FormData();
            UPLOAD_FIELDS_CONFIG.forEach((f) => {
                if (files[f.name])
                    formData.append(f.name, files[f.name] as File);
            });
            formData.append("nomorDaftar", regID);

            await api.ospek.uploadPrasyarat(formData);
            toast.success(t("toast.uploadSuccess"));
            // Force refresh or redirect?
            setTimeout(() => window.location.reload(), 1500);
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err);
            const commonKey = errorMessage
                ? getCommonErrorKey(errorMessage)
                : null;
            const message =
                commonKey !== null
                    ? tCommon(commonKey)
                    : errorMessage || t("toast.uploadError");
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <PageHeader />

                {isFetchingData ? (
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
                    <>
                        <StatusCard
                            status={status}
                            notes={catatanPemeriksaan}
                        />

                        <section className={styles.card}>
                            <div className={styles.cardHeaderLine}>
                                <span className={styles.cardHeaderIcon}>
                                    ⬆️
                                </span>
                                <h2 className={styles.cardTitle}>
                                    {t("upload.title")}
                                </h2>
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "var(--space-l)",
                                }}
                            >
                                {UPLOAD_FIELDS_CONFIG.map((field) => (
                                    <UploadZone
                                        key={field.name}
                                        label={t(field.labelKey)}
                                        file={files[field.name]}
                                        onFileChange={(file) =>
                                            handleFileChange(field.name, file)
                                        }
                                        exampleHref={field.exampleHref}
                                        exampleLabel={
                                            field.exampleLabelKey
                                                ? t(field.exampleLabelKey)
                                                : undefined
                                        }
                                    />
                                ))}
                            </div>

                            <div className={styles.formActions}>
                                <button
                                    type="button"
                                    className={`${styles.btn} ${styles.btnPrimary}`}
                                    onClick={handleUpload}
                                    disabled={isLoading}
                                    aria-busy={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <span
                                                className={styles.spinner}
                                                aria-hidden="true"
                                            />{" "}
                                            {t("btn.uploading")}
                                        </>
                                    ) : (
                                        <>
                                            <UploadCloudIcon />
                                            {t("btn.upload")}
                                        </>
                                    )}
                                </button>
                            </div>
                        </section>

                        <div className={styles.pageFooterActions}>
                            <button
                                type="button"
                                className={`${styles.btn} ${styles.btnSecondaryOutline}`}
                                onClick={() => router.back()}
                            >
                                <ArrowLeftIcon />
                                {t("btn.back")}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}
