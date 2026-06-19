"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { infoList } from "@/constants/infoUmum";
import clsx from "clsx";
import InfoCard from "./InfoCard";
import styles from "./InfoUmum.module.scss";

const ITEMS_PER_PAGE = 6;

export default function InfoUmum() {
    const t = useTranslations();

    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(infoList.length / ITEMS_PER_PAGE);

    const currentItems = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

        return infoList.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [currentPage]);

    return (
        <section className={styles.section}>
            {infoList.length > 0 ? (
                <>
                    <div className={styles.grid}>
                        {currentItems.map((post) => (
                            <InfoCard key={post.id} post={post} />
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className={styles.pagination}>
                            <button
                                type="button"
                                className={clsx(
                                    styles.pageButton,
                                    currentPage === 1 && styles.disabled,
                                )}
                                disabled={currentPage === 1}
                                onClick={() =>
                                    setCurrentPage((prev) => prev - 1)
                                }
                            >
                                Prev
                            </button>

                            <div className={styles.pageNumbers}>
                                {Array.from(
                                    { length: totalPages },
                                    (_, index) => {
                                        const page = index + 1;

                                        return (
                                            <button
                                                key={page}
                                                type="button"
                                                className={clsx(
                                                    styles.pageButton,
                                                    currentPage === page &&
                                                        styles.activePage,
                                                )}
                                                onClick={() =>
                                                    setCurrentPage(page)
                                                }
                                            >
                                                {page}
                                            </button>
                                        );
                                    },
                                )}
                            </div>

                            <button
                                type="button"
                                className={clsx(
                                    styles.pageButton,
                                    currentPage === totalPages &&
                                        styles.disabled,
                                )}
                                disabled={currentPage === totalPages}
                                onClick={() =>
                                    setCurrentPage((prev) => prev + 1)
                                }
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className={styles.empty}>
                    <p>{t("infoUmum.empty")}</p>
                </div>
            )}
        </section>
    );
}
