import { ChevronIcon } from "@/components/Icons/Icons";
import StatusBadge from "./StatusBadge";
import styles from "./SectionCard.module.scss";

interface SectionCardProps {
    id: string;
    number: number;
    title: string;
    status: "empty" | "partial" | "complete";
    collapsed: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}

export default function SectionCard({
    id,
    number,
    title,
    status,
    collapsed,
    onToggle,
    children,
}: SectionCardProps) {
    return (
        <section id={id} className={styles.sectionCard}>
            <div
                className={styles.sectionHeader}
                onClick={onToggle}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") onToggle();
                }}
            >
                <div className={styles.sectionHeaderLeft}>
                    <span className={styles.sectionNumber}>{number}</span>
                    <h2 className={styles.sectionTitle}>{title}</h2>
                </div>
                <StatusBadge status={status} />
                <button
                    type="button"
                    className={`${styles.collapseToggle} ${collapsed ? styles.collapsed : ""}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggle();
                    }}
                    aria-label={collapsed ? "Buka bagian" : "Tutup bagian"}
                >
                    <ChevronIcon />
                </button>
            </div>
            {!collapsed && <div className={styles.sectionBody}>{children}</div>}
        </section>
    );
}
