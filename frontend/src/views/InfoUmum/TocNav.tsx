"use client";

import scrollToId from "@/utils/ScrollToId";
import styles from "./InfoDetail.module.scss";

interface TocItem {
    id: string;
    label: string;
}

interface TocNavProps {
    toc: TocItem[];
}

export default function TocNav({ toc }: TocNavProps) {
    return (
        <div className={styles.tocInline}>
            {toc.map((item) => (
                <button
                    key={item.id}
                    type="button"
                    className={styles.tocPill}
                    onClick={() => scrollToId(item.id)}
                >
                    {item.label}
                </button>
            ))}
        </div>
    );
}
