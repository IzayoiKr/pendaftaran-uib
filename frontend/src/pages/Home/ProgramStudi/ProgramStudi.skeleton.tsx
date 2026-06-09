"use client";

import Skeleton from "react-loading-skeleton";
import styles from "./ProgramStudi.module.scss";
import skeleton from "./ProgramStudi.skeleton.module.scss";

function CardSkeleton() {
    return (
        <div className={styles.card}>
            <div className={styles.courseHead}>
                <Skeleton className={skeleton.cardImage} />
            </div>

            <div className={styles.courseContent}>
                <Skeleton className={skeleton.badge} />

                <Skeleton className={skeleton.tag} />

                <h3>
                    <Skeleton className={skeleton.cardTitle} />
                </h3>

                <div className={styles.description}>
                    <div className={skeleton.descriptionClamp}>
                        <Skeleton className={skeleton.cardText} count={3} />
                    </div>
                </div>

                <Skeleton className={skeleton.toggleBtn} />
            </div>
        </div>
    );
}

export default function ProgramStudiSkeleton() {
    return (
        <section
            className={styles.programStudi}
            aria-busy="true"
            aria-label="Memuat program studi"
        >
            <div className={styles.container}>
                <div className={styles.sectionHeader}>
                    <Skeleton className={skeleton.sectionTitle} />

                    <Skeleton className={skeleton.sectionSubtitle} />
                </div>

                <div className={styles.carouselWrapper}>
                    <div
                        className={`${styles.navBtn} ${skeleton.navBtnSkeleton} ${styles.prev}`}
                        aria-hidden="true"
                    >
                        <Skeleton circle className={skeleton.navCircle} />
                    </div>

                    <div className={styles.viewport}>
                        <div className={styles.track}>
                            {Array.from({
                                length: 6,
                            }).map((_, i) => (
                                <div key={i} className={styles.slide}>
                                    <CardSkeleton />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div
                        className={`${styles.navBtn} ${skeleton.navBtnSkeleton} ${styles.next}`}
                        aria-hidden="true"
                    >
                        <Skeleton circle className={skeleton.navCircle} />
                    </div>
                </div>

                <div className={styles.dots} aria-hidden="true">
                    {Array.from({
                        length: 6,
                    }).map((_, i) => (
                        <Skeleton key={i} circle className={skeleton.dot} />
                    ))}
                </div>
            </div>
        </section>
    );
}
