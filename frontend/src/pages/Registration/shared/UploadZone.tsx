"use client";

import { useCallback, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { UPLOAD_CONSTRAINTS } from "@/pages/Registration/registerOptions";
import { FileIcon, XIcon } from "@/components/Icons/Icons";
import { type DocumentField, getDocumentDisplay } from "../types";
import styles from "./UploadZone.module.scss";

interface UploadZoneProps {
    label: string;
    name: string;
    required?: boolean;
    file?: DocumentField;
    onFileChange?: (file: DocumentField) => void;
    error?: string;
    readOnly?: boolean;
}

function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadZone({
    label,
    name,
    required,
    file,
    onFileChange,
    error,
    readOnly = false,
}: UploadZoneProps) {
    const t = useTranslations("options");
    const tr = useTranslations("registration");
    const [isDragOver, setIsDragOver] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const zoneRef = useRef<HTMLDivElement>(null);

    const validateFile = useCallback((f: File): string | null => {
        if (
            !UPLOAD_CONSTRAINTS.acceptedTypes.includes(
                f.type as "application/pdf",
            )
        ) {
            return `Hanya file PDF yang diperbolehkan (Only PDF files allowed)`;
        }
        if (f.size > UPLOAD_CONSTRAINTS.maxSizeBytes) {
            return `Ukuran file melebihi batas ${UPLOAD_CONSTRAINTS.maxSizeLabel} (File exceeds size limit)`;
        }
        return null;
    }, []);

    const processFile = useCallback(
        (f: File) => {
            const validationError = validateFile(f);
            setLocalError(validationError);
            if (!validationError) {
                onFileChange?.(f);
            }
        },
        [validateFile, onFileChange],
    );

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const f = e.target.files?.[0];
            if (f) processFile(f);
            e.target.value = "";
        },
        [processFile],
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
            const f = e.dataTransfer.files?.[0];
            if (f) processFile(f);
        },
        [processFile],
    );

    const handleRemove = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            setLocalError(null);
            onFileChange?.(null);
            if (inputRef.current) inputRef.current.value = "";
        },
        [onFileChange],
    );

    const openPicker = useCallback(() => {
        inputRef.current?.click();
    }, []);

    const effectiveError = error || localError;

    const zoneClasses = [
        styles.uploadZone,
        isDragOver ? styles.dragover : "",
        effectiveError ? styles.error : "",
        file ? styles.success : "",
    ]
        .filter(Boolean)
        .join(" ");

    const displayInfo = file ? getDocumentDisplay(file) : null;

    return (
        <div className={styles.formField}>
            <label>
                {label}
                {required && <span className={styles.required}>*</span>}
                {!required && (
                    <span className={styles.optionalBadge}>
                        {tr("hints.optional")}
                    </span>
                )}
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
                aria-label={
                    file
                        ? t("fileSelected", {
                            fileName: displayInfo?.name ?? "",
                        })
                        : t("uploadLabel", { label })
                }
            >
                {displayInfo ? (
                    <div className={styles.uploadPreview}>
                        <FileIcon />
                        <div className={styles.fileInfo}>
                            <span className={styles.fileName}>
                                {displayInfo.name}
                            </span>
                            <span className={styles.fileSize}>
                                {formatSize(displayInfo.size)}
                            </span>
                        </div>
                        <div className={styles.uploadActions}>
                            <button
                                type="button"
                                className={styles.removeBtn}
                                onClick={handleRemove}
                                aria-label={t("removeFile")}
                                title={t("removeFile")}
                                disabled={readOnly}
                            >
                                <XIcon />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className={styles.uploadPlaceholder}>
                        <span className={styles.uploadIcon}>
                            <FileIcon />
                        </span>
                        <span>{t("uploadPlaceholder")}</span>
                        <span className={styles.uploadHint}>
                            {t("uploadHint", {
                                maxSize: UPLOAD_CONSTRAINTS.maxSizeLabel,
                            })}
                        </span>
                    </div>
                )}
            </div>

            <input
                ref={inputRef}
                type="file"
                name={name}
                accept={UPLOAD_CONSTRAINTS.acceptedExtensions}
                style={{ display: "none" }}
                onChange={handleInputChange}
                tabIndex={-1}
                aria-hidden="true"
                readOnly={readOnly}
                disabled={readOnly}
            />

            {effectiveError && (
                <span className={styles.errorMsg}>{effectiveError}</span>
            )}
        </div>
    );
}
