"use client";

import { useEffect, useRef } from "react";
import { WarningIcon, XIcon } from "@/components/Icons/Icons";
import styles from "./ConfirmDialog.module.scss";

export interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: "danger" | "warning" | "primary";
    isLoading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmDialog({
    isOpen,
    title,
    message,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    variant = "danger",
    isLoading = false,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    const confirmRef = useRef<HTMLButtonElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;

        confirmRef.current?.focus();

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onCancel();
            }
            if (e.key === "Tab") {
                const focusable = overlayRef.current?.querySelectorAll<HTMLElement>(
                    'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                if (!focusable || focusable.length === 0) return;
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [isOpen, onCancel]);

    if (!isOpen) return null;

    return (
        <div
            ref={overlayRef}
            className={styles.overlay}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-message"
            onClick={(e) => {
                if (e.target === e.currentTarget) onCancel();
            }}
        >
            <div className={styles.dialog}>
                <div className={styles.header}>
                    <div className={`${styles.iconWrap} ${styles[variant]}`}>
                        <WarningIcon />
                    </div>
                    <button
                        type="button"
                        className={styles.closeBtn}
                        onClick={onCancel}
                        aria-label="Close"
                        disabled={isLoading}
                    >
                        <XIcon />
                    </button>
                </div>

                <div className={styles.body}>
                    <h3 id="confirm-title" className={styles.title}>
                        {title}
                    </h3>
                    <p id="confirm-message" className={styles.message}>
                        {message}
                    </p>
                </div>

                <div className={styles.footer}>
                    <button
                        type="button"
                        className={`${styles.btn} ${styles.cancel}`}
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        {cancelLabel}
                    </button>
                    <button
                        ref={confirmRef}
                        type="button"
                        className={`${styles.btn} ${styles[variant]}`}
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className={styles.spinner} />
                        ) : (
                            confirmLabel
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
