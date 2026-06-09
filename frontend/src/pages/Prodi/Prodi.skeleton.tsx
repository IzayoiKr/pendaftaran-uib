"use client";

import Skeleton from "react-loading-skeleton";
import styles from "./Prodi.module.scss";
import skeleton from "./Prodi.skeleton.module.scss";

function InfoItemSkeleton() {
    return (
        <div className={styles.infoItem}>
            <span className={`${styles.infoLabel} ${skeleton.infoLabel}`}>
                <Skeleton width={100} height={14} />
            </span>
            <span className={`${styles.infoValue} ${skeleton.infoValue}`}>
                <Skeleton width="80%" height={18} />
            </span>
        </div>
    );
}

function FormGroupSkeleton({ readOnly = false }: { readOnly?: boolean }) {
    return (
        <div className={styles.formGroup}>
            <span className={`${styles.formLabel} ${skeleton.formLabel}`}>
                <Skeleton width="50%" height={14} />
            </span>
            {readOnly ? (
                <div
                    className={`${styles.readOnlyValue} ${skeleton.readOnlyValue}`}
                >
                    <Skeleton width="90%" height={18} />
                </div>
            ) : (
                <Skeleton height={42} width="100%" borderRadius={8} />
            )}
        </div>
    );
}

function HistoryItemSkeleton() {
    return (
        <div className={styles.historyItem}>
            <div className={styles.itemHeader}>
                <div className={styles.itemDate}>
                    <span className={styles.dateDay}>
                        <Skeleton width={24} height={22} />
                    </span>
                    <span className={styles.dateMonth}>
                        <Skeleton width={28} height={14} />
                    </span>
                    <span className={styles.dateYear}>
                        <Skeleton width={32} height={12} />
                    </span>
                </div>
                <div className={styles.itemControls}>
                    <Skeleton width={80} height={24} borderRadius={999} />
                    <Skeleton circle width={32} height={32} />
                </div>
            </div>
            <div className={styles.itemRoute}>
                <div className={styles.routeOrigin}>
                    <span className={styles.routeLabel}>Dari</span>
                    <span className={styles.routeValue}>
                        <Skeleton width={120} height={16} />
                    </span>
                </div>
                <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={styles.routeArrow}
                >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                <div className={styles.routeTarget}>
                    <span className={styles.routeLabel}>Ke</span>
                    <span className={styles.routeValue}>
                        <Skeleton width={120} height={16} />
                    </span>
                </div>
            </div>
        </div>
    );
}

export default function ProdiSkeleton() {
    return (
        <section className={styles.prodi} aria-hidden="true">
            <div className={styles.prodiContent}>
                {/* Back Link */}
                <div className={styles.pageHeader}>
                    <div className={`${styles.backLink} ${skeleton.backLink}`}>
                        <Skeleton circle width={16} height={16} />
                        <Skeleton width={120} height={16} />
                    </div>
                </div>

                <div className={styles.layoutGrid}>
                    {/* Main Column */}
                    <div className={styles.mainColumn}>
                        {/* History Card */}
                        <div className={styles.card}>
                            <div className={styles.cardHeader}>
                                <span
                                    className={`${styles.cardHeaderIcon} ${skeleton.headerIcon}`}
                                >
                                    <Skeleton width={20} height={20} />
                                </span>
                                <h2
                                    className={`${styles.cardTitle} ${skeleton.cardTitle}`}
                                >
                                    <Skeleton width={180} height={22} />
                                </h2>
                            </div>
                            <div className={styles.historyList}>
                                <HistoryItemSkeleton />
                                <HistoryItemSkeleton />
                            </div>
                        </div>

                        {/* Form Card */}
                        <div className={styles.card}>
                            <div className={styles.cardHeader}>
                                <span
                                    className={`${styles.cardHeaderIcon} ${skeleton.headerIcon}`}
                                >
                                    <Skeleton width={20} height={20} />
                                </span>
                                <h2
                                    className={`${styles.cardTitle} ${skeleton.cardTitle}`}
                                >
                                    <Skeleton width={220} height={22} />
                                </h2>
                            </div>
                            <div className={styles.formGrid}>
                                <FormGroupSkeleton readOnly />
                                <FormGroupSkeleton readOnly />
                                <FormGroupSkeleton />
                                <FormGroupSkeleton />
                            </div>
                            <div className={styles.formActions}>
                                <Skeleton
                                    width={80}
                                    height={36}
                                    borderRadius={8}
                                />
                                <Skeleton
                                    width={140}
                                    height={36}
                                    borderRadius={8}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Side Column */}
                    <aside className={styles.sideColumn}>
                        <div className={styles.card}>
                            <div className={styles.cardHeader}>
                                <span
                                    className={`${styles.cardHeaderIcon} ${skeleton.headerIcon}`}
                                >
                                    <Skeleton width={20} height={20} />
                                </span>
                                <h2
                                    className={`${styles.cardTitle} ${skeleton.cardTitle}`}
                                >
                                    <Skeleton width={180} height={22} />
                                </h2>
                            </div>
                            <div className={styles.detailsGrid}>
                                <InfoItemSkeleton />
                                <InfoItemSkeleton />
                                <InfoItemSkeleton />
                                <InfoItemSkeleton />
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </section>
    );
}
