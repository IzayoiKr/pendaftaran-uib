'use client';

import Skeleton from 'react-loading-skeleton';
import styles from './Account.module.scss';
import skeleton from './Account.skeleton.module.scss';

export default function AccountSkeleton() {
    return (
        <div className={styles.pageContent}>
            <div className={styles.accountBox}>
                <h2 className={styles.accountTitle}>
                    <Skeleton className={skeleton.titleSkeleton} />
                </h2>

                <div className={skeleton.accountInfo}>
                    {[1, 2, 3].map(i => (
                        <div key={i} className={styles.infoRow}>
                            <span className={styles.infoLabel}>
                                <Skeleton className={skeleton.labelSkeleton} />
                            </span>
                            <span className={styles.infoValue}>
                                <Skeleton className={skeleton.valueSkeleton} />
                            </span>
                        </div>
                    ))}
                </div>

                <h3 className={styles.sectionTitle}>
                    <Skeleton className={skeleton.sectionSkeleton} />
                </h3>

                <div className={styles.emptyState}>
                    <Skeleton className={skeleton.emptyTextSkeleton} />
                    <Skeleton className={skeleton.emptyButtonSkeleton} />
                </div>

                <div className={styles.bottomActions}>
                    {[1, 2, 3].map(i => (
                        <Skeleton key={i} className={skeleton.actionSkeleton} />
                    ))}
                </div>
            </div>
        </div>
    );
}
