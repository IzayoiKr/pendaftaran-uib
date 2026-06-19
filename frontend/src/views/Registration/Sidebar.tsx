"use client";

import { useTranslations } from "next-intl";
import type { SectionStatus } from "@/views/Registration/types";
import { CheckIcon } from "@/components/Icons/Icons";
import styles from "./Sidebar.module.scss";

interface SidebarProps {
    level: "S1" | "S2";
    onNavClick: (id: string) => void;
    sectionStatuses: Record<string, SectionStatus>;
}

export default function Sidebar({
    level,
    onNavClick,
    sectionStatuses,
}: SidebarProps) {
    const t = useTranslations("registration");

    const s1Items = [
        { id: "identity", label: t("sections.identity.title") },
        { id: "education", label: t("sections.education.title") },
    ];
    const s2Items = [
        { id: "biodata", label: t("sections.biodata.title") },
        { id: "parent", label: t("sections.parent.title") },
    ];
    const sharedItems = [
        { id: "document", label: t("sections.document.title") },
        { id: "payment", label: t("sections.payment.title") },
    ];

    const items = [...(level === "S1" ? s1Items : s2Items), ...sharedItems];

    return (
        <nav className={styles.sidebar} aria-label="Formulir sections">
            {items.map((item, i) => {
                const status = sectionStatuses[item.id] ?? "empty";
                const isComplete = status === "complete";

                return (
                    <button
                        key={item.id}
                        className={`${styles.navItem} ${styles[status]}`}
                        onClick={() => onNavClick(item.id)}
                        type="button"
                    >
                        <span
                            className={`${styles.navStatus} ${styles[status]}`}
                        >
                            {isComplete ? <CheckIcon /> : i + 1}
                        </span>
                        {item.label}
                    </button>
                );
            })}
        </nav>
    );
}
