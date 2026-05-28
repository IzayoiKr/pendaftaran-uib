"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import scrollToId from "@/utils/ScrollToId";
import styles from "./Hero.module.scss";

interface handleClickProps {
    e: React.MouseEvent<HTMLAnchorElement>;
    hashId: string;
}

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

function Content() {
    const t = useTranslations("hero");

    return (
        <div className={styles.content}>
            <h1>{t("heading")}</h1>
            <p>{t("description")}</p>
        </div>
    );
}

function HeroButtons() {
    const pathname = usePathname();
    const t = useTranslations("hero");

    const handleClick = ({ e, hashId }: handleClickProps) => {
        if (hashId && pathname === "/") {
            e.preventDefault();
            scrollToId(hashId);
        }
    };

    return (
        <div className={styles.heroButtons}>
            <Link
                href="#gelombang"
                className={styles.btnPrimary}
                onClick={(e) => handleClick({ e: e, hashId: "gelombang" })}
            >
                {t("buttonRegistration")}
            </Link>
            <Link
                href="#program"
                className={styles.btnSecondary}
                onClick={(e) => handleClick({ e: e, hashId: "program" })}
            >
                {t("buttonAcademic")}
            </Link>
        </div>
    );
}

export default function Hero() {
    return (
        <section id="home" className={styles.hero}>
            <HeroPicture />
            <div className={styles.container}>
                <Content />
                <HeroButtons />
            </div>
        </section>
    );
}
