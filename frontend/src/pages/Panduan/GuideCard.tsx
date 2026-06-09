import { memo } from "react";
import type { ReactNode } from "react";
import styles from "./GuideCard.module.scss";

const formatStep = (step: number) => String(step).padStart(2, "0");

const ArrowUpRight = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <line x1="7" y1="17" x2="17" y2="7" />
        <polyline points="7 7 17 7 17 17" />
    </svg>
);

interface Props {
    step: number;
    title: string;
    description: string;
    pdfUrl: string;
    icon: ReactNode;
    ctaLabel: string;
}

const GuideCard = memo(function GuideCard({
    step,
    title,
    description,
    pdfUrl,
    icon,
    ctaLabel,
}: Props) {
    return (
        <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${ctaLabel} ${title} (PDF)`}
            className={styles.card}
        >
            <div className={styles.top}>
                <div className={styles.iconWrap}>{icon}</div>

                <span className={styles.stepNum}>{formatStep(step)}</span>
            </div>

            <div className={styles.body}>
                <h3 className={styles.title}>{title}</h3>

                <p className={styles.desc}>{description}</p>
            </div>

            <div className={styles.cta}>
                <span>{ctaLabel}</span>
                <ArrowUpRight />
            </div>
        </a>
    );
});

export default GuideCard;
