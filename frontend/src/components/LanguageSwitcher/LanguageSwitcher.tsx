"use client";

import { useLocale } from "next-intl";
import Image from "next/image";
import { usePathname, useRouter } from "@/i18n/navigation";
import clsx from "clsx";
import styles from "./LanguageSwitcher.module.scss";

export default function LanguageSwitcher() {
    const locale = useLocale();

    const router = useRouter();

    const pathname = usePathname();

    const isEn = locale === "en";

    const nextLocale = isEn ? "id" : "en";

    const handleSwitch = () => {
        router.replace(pathname, { locale: nextLocale });
    };

    return (
        <button
            type="button"
            onClick={handleSwitch}
            className={clsx(styles.switcher, isEn && styles.enActive)}
            aria-label="Switch language"
        >
            <div className={styles.toggle} />

            <div className={clsx(styles.segment, styles.segmentId)}>
                <Image
                    src="/images/flag/id.svg"
                    alt="Indonesia"
                    width={16}
                    height={16}
                    className={styles.flag}
                />
                ID
            </div>

            <div className={clsx(styles.segment, styles.segmentEn)}>
                <Image
                    src="/images/flag/en.svg"
                    alt="English"
                    width={16}
                    height={16}
                    className={styles.flag}
                />
                EN
            </div>
        </button>
    );
}
