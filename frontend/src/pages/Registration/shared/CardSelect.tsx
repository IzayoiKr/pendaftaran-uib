"use client";

import { useTranslations } from "next-intl";
import styles from "./CardSelect.module.scss";

interface CardSelectProps {
    options: Array<{ value: string | number | null; label: string }>;
    value: string | number | null;
    onChange: (val: string | number | null) => void;
}

export default function CardSelect({
    options,
    value,
    onChange,
}: CardSelectProps) {
    const t = useTranslations("options");

    return (
        <div className={styles.cardSelectGroup}>
            {options.map((opt) => (
                <button
                    key={opt.value}
                    type="button"
                    className={`${styles.cardSelect} ${value === opt.value ? styles.active : ""}`}
                    onClick={() =>
                        onChange(value === opt.value ? null : opt.value)
                    }
                >
                    {t(opt.label)}
                </button>
            ))}
        </div>
    );
}
