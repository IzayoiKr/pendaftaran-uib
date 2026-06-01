"use client";

import Skeleton from "react-loading-skeleton";
import styles from "./Account.module.scss";
import skeleton from "./Account.skeleton.module.scss";

export default function AccountSkeleton() {
    return (
        <section className={styles.account}>
            <div className={styles.profileHero}>
                <div className={styles.heroInner}>
                    <div className={`${styles.avatar} ${skeleton.avatar}`}>
                        <Skeleton circle width={72} height={72} />
                    </div>
                    <div className={styles.heroText}>
                        <h1
                            className={`${styles.heroName} ${skeleton.heroName}`}
                        >
                            <Skeleton width={240} height={28} />
                        </h1>
                        <p
                            className={`${styles.heroSubtitle} ${skeleton.heroSubtitle}`}
                        >
                            <Skeleton width={140} height={16} />
                        </p>
                    </div>
                </div>
            </div>

            <main className={styles.accountContent}>
                <div className={styles.layoutGrid}>
                    <div className={styles.mainColumn}>
                        <section
                            className={`${styles.card} ${styles.cardAccent}`}
                        >
                            <div className={styles.cardHeaderLine}>
                                <div
                                    className={`${styles.cardHeaderIcon} ${skeleton.headerIcon}`}
                                >
                                    <Skeleton width={20} height={20} />
                                </div>
                                <h2
                                    className={`${styles.cardTitle} ${skeleton.cardTitle}`}
                                >
                                    <Skeleton width={180} height={22} />
                                </h2>
                                <span
                                    className={`${styles.statusBadge} ${skeleton.statusBadge}`}
                                >
                                    <Skeleton width={80} height={20} />
                                </span>
                            </div>

                            <div className={styles.infoGrid}>
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className={styles.infoItem}>
                                        <span
                                            className={`${styles.infoItemLabel} ${skeleton.infoLabel}`}
                                        >
                                            <Skeleton width={80} height={14} />
                                        </span>
                                        <span
                                            className={`${styles.infoItemValue} ${skeleton.infoValue}`}
                                        >
                                            <Skeleton width={140} height={18} />
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className={styles.actionBar}>
                                <div
                                    className={`${styles.btn} ${styles.btnPrimary} ${skeleton.actionBtn}`}
                                >
                                    <Skeleton
                                        width={100}
                                        height={36}
                                        borderRadius={8}
                                    />
                                </div>
                                <div
                                    className={`${styles.btn} ${styles.btnDangerOutline} ${skeleton.actionBtn}`}
                                >
                                    <Skeleton
                                        width={100}
                                        height={36}
                                        borderRadius={8}
                                    />
                                </div>
                            </div>
                        </section>
                    </div>

                    <aside className={styles.sideColumn}>
                        <section className={styles.card}>
                            <div className={styles.cardHeaderLine}>
                                <div
                                    className={`${styles.cardHeaderIcon} ${skeleton.headerIcon}`}
                                >
                                    <Skeleton width={20} height={20} />
                                </div>
                                <h2
                                    className={`${styles.cardTitle} ${skeleton.cardTitle}`}
                                >
                                    <Skeleton width={120} height={22} />
                                </h2>
                            </div>
                            <div className={styles.detailsGrid}>
                                {[1, 2].map((i) => (
                                    <div key={i} className={styles.detailItem}>
                                        <span
                                            className={`${styles.detailLabel} ${skeleton.detailLabel}`}
                                        >
                                            <Skeleton width={80} height={14} />
                                        </span>
                                        <span
                                            className={`${styles.detailValue} ${skeleton.detailValue}`}
                                        >
                                            <Skeleton width={200} height={18} />
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className={styles.card}>
                            <div className={styles.cardHeaderLine}>
                                <div
                                    className={`${styles.cardHeaderIcon} ${skeleton.headerIcon}`}
                                >
                                    <Skeleton width={20} height={20} />
                                </div>
                                <h2
                                    className={`${styles.cardTitle} ${skeleton.cardTitle}`}
                                >
                                    <Skeleton width={140} height={22} />
                                </h2>
                            </div>
                            <div className={styles.quickGrid}>
                                {[1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className={`${styles.quickBtn} ${skeleton.quickBtn}`}
                                    >
                                        <Skeleton width={24} height={24} />
                                        <Skeleton width={120} height={16} />
                                    </div>
                                ))}
                            </div>
                        </section>
                    </aside>
                </div>
            </main>
        </section>
    );
}
