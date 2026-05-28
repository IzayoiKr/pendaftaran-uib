"use client";

import Skeleton from "react-loading-skeleton";
import styles from "./ProgramStudi.module.scss";
import skeleton from "./ProgramStudi.skeleton.module.scss";

export default function ProgramStudiSkeleton() {
    return (
        <section className={styles.programStudi}>
            <div className={styles.container}>
                <div className={styles.sectionHeader}>
                    <Skeleton className={skeleton.sectionTitle} />
                    <Skeleton className={skeleton.sectionSubtitle} />
                </div>

                <div className={styles.carouselWrapper}>
                    <div
                        className={`${styles.navBtn} ${styles.prev}`}
                        aria-hidden="true"
                    >
                        ‹
                    </div>

                    <div className={styles.viewport}>
                        <div className={styles.track}>
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className={styles.slide}>
                                    <div className={styles.card}>
                                        <div className={styles.courseHead}>
                                            <Skeleton
                                                className={skeleton.cardImage}
                                            />
                                        </div>
                                        <div className={styles.courseContent}>
                                            <Skeleton
                                                className={skeleton.badge}
                                            />
                                            <Skeleton
                                                className={skeleton.tag}
                                            />
                                            <h3>
                                                <Skeleton
                                                    className={
                                                        skeleton.cardTitle
                                                    }
                                                />
                                            </h3>
                                            <Skeleton
                                                className={skeleton.cardText}
                                                count={2}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div
                        className={`${styles.navBtn} ${styles.next}`}
                        aria-hidden="true"
                    >
                        ›
                    </div>
                </div>

                <div className={styles.dots}>
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className={styles.dot}
                            aria-hidden="true"
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
