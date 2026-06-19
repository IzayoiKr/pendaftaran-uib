"use client";

import Skeleton from "react-loading-skeleton";
import styles from "./Registration.module.scss";
import skeleton from "./Registration.skeleton.module.scss";
import sidebarStyles from "./Sidebar.module.scss";
import cardSelectStyles from "./shared/CardSelect.module.scss";
import displayStyles from "./shared/DisplayField.module.scss";
import formStyles from "./shared/FormField.module.scss";
import sectionStyles from "./shared/SectionCard.module.scss";
import uploadStyles from "./shared/UploadZone.module.scss";

function FormFieldSkeleton() {
    return (
        <div className={formStyles.formField}>
            <label>
                <Skeleton width="40%" height={14} />
            </label>
            <Skeleton height={42} width="100%" borderRadius={8} />
        </div>
    );
}

function DisplayFieldSkeleton() {
    return (
        <div className={displayStyles.displayField}>
            <span className={displayStyles.displayLabel}>
                <Skeleton width={80} height={14} />
            </span>
            <div className={displayStyles.displayValue}>
                <Skeleton width="100%" height={20} />
            </div>
        </div>
    );
}

function UploadZoneSkeleton() {
    return (
        <div className={uploadStyles.formField}>
            <label>
                <Skeleton width={100} height={14} />
            </label>
            <div
                className={`${uploadStyles.uploadZone} ${skeleton.uploadZoneSkeleton}`}
            >
                <Skeleton width="60%" height={16} />
            </div>
        </div>
    );
}

function SectionCardSkeleton({
    children,
}: {
    number: number;
    children: React.ReactNode;
}) {
    return (
        <section className={sectionStyles.sectionCard}>
            <div className={sectionStyles.sectionHeader}>
                <div className={sectionStyles.sectionHeaderLeft}>
                    <span className={sectionStyles.sectionNumber}>
                        <Skeleton circle width={28} height={28} />
                    </span>
                    <h2 className={sectionStyles.sectionTitle}>
                        <Skeleton width={160} height={20} />
                    </h2>
                </div>
                <Skeleton width={60} height={20} borderRadius={999} />
                <span className={sectionStyles.collapseToggle}>
                    <Skeleton circle width={28} height={28} />
                </span>
            </div>
            <div className={sectionStyles.sectionBody}>{children}</div>
        </section>
    );
}

export default function RegistrationSkeleton() {
    return (
        <section className={styles.registrationPage} aria-hidden="true">
            <nav className={sidebarStyles.sidebar}>
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className={`${sidebarStyles.navItem} ${skeleton.navItemSkeleton}`}
                    >
                        <span className={sidebarStyles.navStatus}>
                            <Skeleton circle width={28} height={28} />
                        </span>
                        <Skeleton width={120} height={16} />
                    </div>
                ))}
            </nav>

            <main className={styles.mainContent}>
                <div className={styles.pageHeader}>
                    <h1 className={styles.pageTitle}>
                        <Skeleton width={280} height={36} />
                    </h1>
                    <p className={styles.pageSubtitle}>
                        <Skeleton width={200} height={20} />
                    </p>
                </div>

                <SectionCardSkeleton number={1}>
                    <div className={styles.formGrid}>
                        <DisplayFieldSkeleton />
                        <DisplayFieldSkeleton />
                        <DisplayFieldSkeleton />
                    </div>
                    <div className={styles.formGrid}>
                        <FormFieldSkeleton />
                        <FormFieldSkeleton />
                        <FormFieldSkeleton />
                        <FormFieldSkeleton />
                        <FormFieldSkeleton />
                        <FormFieldSkeleton />
                    </div>
                </SectionCardSkeleton>

                <SectionCardSkeleton number={2}>
                    <div className={styles.formGrid}>
                        <FormFieldSkeleton />
                        <FormFieldSkeleton />
                        <FormFieldSkeleton />
                        <FormFieldSkeleton />
                    </div>
                    <div className={formStyles.formField}>
                        <label>
                            <Skeleton width="30%" height={14} />
                        </label>
                        <div className={cardSelectStyles.cardSelectGroup}>
                            <Skeleton
                                height={48}
                                width="100%"
                                borderRadius={8}
                            />
                            <Skeleton
                                height={48}
                                width="100%"
                                borderRadius={8}
                            />
                        </div>
                    </div>
                </SectionCardSkeleton>

                <SectionCardSkeleton number={3}>
                    <p className={styles.hint}>
                        <Skeleton width={260} height={14} />
                    </p>
                    <div className={styles.formGrid}>
                        <UploadZoneSkeleton />
                        <UploadZoneSkeleton />
                        <UploadZoneSkeleton />
                        <UploadZoneSkeleton />
                    </div>
                </SectionCardSkeleton>

                <SectionCardSkeleton number={4}>
                    <div
                        className={`${styles.paymentInfoCard} ${skeleton.paymentInfoCardSkeleton}`}
                    >
                        <h3>
                            <Skeleton width={160} height={22} />
                        </h3>
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className={skeleton.paymentLine}>
                                <Skeleton width="35%" height={16} />
                                <Skeleton width="35%" height={16} />
                            </div>
                        ))}
                        <Skeleton width={140} height={32} borderRadius={8} />
                    </div>
                    <div className={styles.formGrid}>
                        <FormFieldSkeleton />
                        <FormFieldSkeleton />
                    </div>
                    <UploadZoneSkeleton />
                </SectionCardSkeleton>

                <div className={styles.confirmationBox}>
                    <label className={styles.checkboxLabel}>
                        <span className={skeleton.checkboxSquare}>
                            <Skeleton width={20} height={20} borderRadius={4} />
                        </span>
                        <Skeleton width="90%" height={16} />
                    </label>
                    <label className={styles.checkboxLabel}>
                        <span className={skeleton.checkboxSquare}>
                            <Skeleton width={20} height={20} borderRadius={4} />
                        </span>
                        <Skeleton width="85%" height={16} />
                    </label>
                    <div className={styles.submitBar}>
                        <Skeleton width={120} height={40} borderRadius={8} />
                        <Skeleton width={140} height={40} borderRadius={8} />
                    </div>
                </div>
            </main>
        </section>
    );
}
