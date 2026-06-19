"use client";

import { useTranslations } from "next-intl";
import { CheckIcon, EmptyIcon, PartialIcon } from "@/components/Icons/Icons";
import styles from "./StatusBadge.module.scss";

interface StatusBadgeProps {
    status: "empty" | "partial" | "complete";
}

export default function StatusBadge({ status }: StatusBadgeProps) {
    const t = useTranslations("options");

    return (
        <span className={`${styles.statusBadge} ${styles[status]}`}>
            {status === "complete" ? (
                <>
                    <CheckIcon /> {t("complete")}
                </>
            ) : status === "partial" ? (
                <>
                    <PartialIcon /> {t("partial")}
                </>
            ) : (
                <>
                    <EmptyIcon /> {t("empty")}
                </>
            )}
        </span>
    );
}
