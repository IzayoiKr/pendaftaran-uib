"use client";

import Skeleton from "react-loading-skeleton";
import styles from "./UpdateProfile.module.scss";
import skeleton from "./UpdateProfile.skeleton.module.scss";

export default function UpdateProfileSkeleton() {
    return (
        <main
            className={styles.updateProfile}
            aria-busy="true"
            aria-label="Memuat halaman profil"
        >
            <div className={styles.container}>
                <div className={styles.profileHeader}>
                    <Skeleton className={skeleton.avatarSkeleton} />
                    <Skeleton className={skeleton.titleSkeleton} />
                </div>

                <div className={styles.formBody}>
                    <section className={styles.infoSection}>
                        <Skeleton className={skeleton.sectionTitleSkeleton} />
                        {[1, 2].map((i) => (
                            <div key={i} className={styles.infoRow}>
                                <div className={styles.infoContent}>
                                    <Skeleton
                                        className={skeleton.infoLabelSkeleton}
                                    />
                                    <Skeleton
                                        className={skeleton.infoValueSkeleton}
                                    />
                                </div>
                            </div>
                        ))}
                    </section>

                    <section className={styles.editSection}>
                        <Skeleton className={skeleton.sectionTitleSkeleton} />
                        <Skeleton className={skeleton.fieldLabelSkeleton} />
                        <Skeleton className={skeleton.inputSkeleton} />
                        <Skeleton className={skeleton.submitBtnSkeleton} />
                    </section>
                </div>
            </div>
        </main>
    );
}
