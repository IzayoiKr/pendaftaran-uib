"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import type { InfoMeta } from "@/constants/infoUmum";
import styles from "./InfoCard.module.scss";

interface InfoCardProps {
    post: InfoMeta;
}

export default function InfoCard({ post }: InfoCardProps) {
    const t = useTranslations();

    return (
        <Link
            href={post.detailLink}
            className={styles.card}
            aria-label={t(post.titleKey)}
        >
            <div className={styles.imageWrap}>
                <Image
                    src={post.image}
                    alt={t(post.titleKey)}
                    fill
                    className={styles.image}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
            </div>

            <div className={styles.body}>
                <h2 className={styles.title}>{t(post.titleKey)}</h2>

                <p className={styles.description}>{t(post.excerptKey)}</p>

                <span className={styles.cta} aria-hidden="true">
                    {t("common.readMore")}

                    <svg
                        className={styles.arrow}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </span>
            </div>
        </Link>
    );
}
