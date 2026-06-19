"use client";

import Skeleton from "react-loading-skeleton";
import styles from "./Gelombang.module.scss";
import skeleton from "./Gelombang.skeleton.module.scss";

export default function GelombangSkeleton() {
    return (
        <section className={styles.section}>
            <div className={styles.sectionInner}>
                <div className={styles.sectionHeader}>
                    <Skeleton className={skeleton.sectionTitle} />
                    <Skeleton className={skeleton.sectionSubtitle} />
                    <Skeleton className={skeleton.sectionDescription} />
                </div>

                <div className={styles.carouselOuter}>
                    <button
                        type="button"
                        className={`${styles.navButton} ${styles.navButtonPrev}`}
                        aria-hidden="true"
                        tabIndex={-1}
                    >
                        ‹
                    </button>

                    <div className={styles.carouselViewport}>
                        <div className={styles.carouselTrack}>
                            {[1, 2].map((i) => (
                                <div className={styles.carouselSlide} key={i}>
                                    <article className={styles.card}>
                                        <div
                                            className={styles.cardImageWrapper}
                                        >
                                            <Skeleton
                                                className={skeleton.cardImage}
                                            />

                                            <div
                                                className={
                                                    skeleton.imageOverlay
                                                }
                                            />

                                            <div
                                                className={
                                                    styles.cardImageTitle
                                                }
                                            >
                                                <Skeleton
                                                    className={
                                                        skeleton.batchName
                                                    }
                                                    width={
                                                        i % 2 === 0
                                                            ? "72%"
                                                            : "64%"
                                                    }
                                                />

                                                <Skeleton
                                                    className={
                                                        skeleton.programName
                                                    }
                                                    width={
                                                        i % 2 === 0
                                                            ? "58%"
                                                            : "70%"
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div className={styles.cardBody}>
                                            <div className={styles.examSection}>
                                                <Skeleton
                                                    className={skeleton.label}
                                                    width="42%"
                                                />

                                                <div
                                                    className={
                                                        styles.examDateRow
                                                    }
                                                >
                                                    <div
                                                        className={
                                                            styles.examCalendarBadge
                                                        }
                                                    >
                                                        <Skeleton
                                                            className={
                                                                skeleton.calendarMonth
                                                            }
                                                        />
                                                        <Skeleton
                                                            className={
                                                                skeleton.calendarDay
                                                            }
                                                        />
                                                        <Skeleton
                                                            className={
                                                                skeleton.calendarDow
                                                            }
                                                        />
                                                    </div>

                                                    <div
                                                        className={
                                                            styles.examDetails
                                                        }
                                                    >
                                                        <Skeleton
                                                            className={
                                                                skeleton.scheduleRow
                                                            }
                                                            width={
                                                                i % 2 === 0
                                                                    ? "82%"
                                                                    : "74%"
                                                            }
                                                        />

                                                        <Skeleton
                                                            className={
                                                                skeleton.scheduleRow
                                                            }
                                                            width={
                                                                i % 2 === 0
                                                                    ? "68%"
                                                                    : "76%"
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <hr
                                                className={styles.cardDivider}
                                                aria-hidden="true"
                                            />

                                            <div
                                                className={
                                                    styles.registrationSection
                                                }
                                            >
                                                <Skeleton
                                                    className={skeleton.label}
                                                    width="48%"
                                                />

                                                <Skeleton
                                                    className={
                                                        skeleton.registrationDates
                                                    }
                                                    width={
                                                        i % 2 === 0
                                                            ? "78%"
                                                            : "66%"
                                                    }
                                                />
                                            </div>

                                            <Skeleton
                                                className={skeleton.cta}
                                                width={
                                                    i % 2 === 0 ? "100%" : "92%"
                                                }
                                            />
                                        </div>
                                    </article>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        type="button"
                        className={`${styles.navButton} ${styles.navButtonNext}`}
                        aria-hidden="true"
                        tabIndex={-1}
                    >
                        ›
                    </button>
                </div>

                <div className={styles.dotList}>
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className={skeleton.dot} />
                    ))}
                </div>
            </div>
        </section>
    );
}
