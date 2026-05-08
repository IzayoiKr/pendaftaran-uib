'use client';

import Skeleton from 'react-loading-skeleton';
import styles from './ProgramStudi.module.scss';
import skeleton from './ProgramStudi.skeleton.module.scss';

export default function ProgramStudiSkeleton() {
    return (
        <section className={styles.programStudi}>
            <div className={styles.container}>
                <div className={styles.sectionHeader}>
                    <Skeleton className={skeleton.sectionTitle} />
                    <Skeleton className={skeleton.sectionSubtitle} />
                </div>
                <div className={styles.carouselWrapper}>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className={styles.slide}>
                            <div className={styles.card}>
                                <Skeleton className={skeleton.cardImage} />
                                <div className={styles.courseContent}>
                                    <Skeleton className={skeleton.badge} />
                                    <Skeleton className={skeleton.tag} />
                                    <Skeleton className={skeleton.cardTitle} />
                                    <Skeleton className={skeleton.cardText} count={2} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
