"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import scrollToId from "@/utils/ScrollToId";
import styles from "./Hero.module.scss";

type HashId = "gelombang" | "program";

function HeroPicture() {
    const t = useTranslations("hero");

    return (
        <Image
            src="/images/hero-bg.jpg"
            width={1920}
            height={1000}
            alt={t("imageAlt")}
            priority
            fetchPriority="high"
        />
    );
}

function HeroCard() {
    const t = useTranslations("hero");
    const tStats = useTranslations("hero.stats");

    const handleClick =
        (hashId: HashId) => (e: React.MouseEvent<HTMLAnchorElement>) => {
            e.preventDefault();
            scrollToId(hashId);
        };

    return (
        <div className={styles.heroCenter}>
            <p className={styles.eyebrow}>{t("eyebrow")}</p>

            <h1 className={styles.heroHeading}>
                {t("headingLine1")}
                <br />
                {t("headingLine2")} <em>{t("headingAccent")}</em>
                <br />
                {t("headingLine3")}
            </h1>

            <div className={styles.heroDivider} />

            <p className={styles.heroDesc}>{t("description")}</p>

            <div className={styles.heroButtons}>
                <Link
                    href="/#gelombang"
                    className={styles.btnPrimary}
                    onClick={handleClick("gelombang")}
                >
                    {t("buttonRegistration")}

                    <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </Link>

                <Link
                    href="/#program"
                    className={styles.btnSecondary}
                    onClick={handleClick("program")}
                >
                    {t("buttonAcademic")}
                </Link>
            </div>

            <div className={styles.heroStats}>
                <div className={styles.statItem}>
                    <span className={styles.statNum}>
                        {tStats("programs.value")}
                    </span>

                    <span className={styles.statLabel}>
                        {tStats("programs.label")}
                    </span>
                </div>

                <div className={styles.statItem}>
                    <span className={styles.statNum}>
                        {tStats("alumni.value")}
                    </span>

                    <span className={styles.statLabel}>
                        {tStats("alumni.label")}
                    </span>
                </div>

                <div className={styles.statItem}>
                    <span className={styles.statNum}>
                        {tStats("ranking.value")}
                    </span>

                    <span className={styles.statLabel}>
                        {tStats("ranking.label")}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default function Hero() {
    return (
        <section id="home" className={styles.hero}>
            <HeroPicture />

            <div className={styles.container}>
                <HeroCard />
            </div>
        </section>
    );
}
