'use client';

import Skeleton from 'react-loading-skeleton';
import styles from './Gelombang.module.scss';
import skeleton from './Gelombang.skeleton.module.scss';

export default function GelombangSkeleton() {
    return (
        <section className={styles.gelombang}>
            <div className={styles.container}>
                <div className={styles.title}>
                    <Skeleton className={skeleton.gelombangTitle} />
                    <Skeleton className={skeleton.gelombangSubtitle} />
                </div>
                <div className={styles.stack}>
                    {[1, 2].map(i => (
                        <div key={i} className={styles.card}>
                            <Skeleton className={skeleton.gelombangCard} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
