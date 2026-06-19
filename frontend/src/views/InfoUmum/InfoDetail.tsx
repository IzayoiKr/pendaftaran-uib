import type { ComponentType } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import type { InfoMeta } from "@/constants/infoUmum";
import { infoList } from "@/constants/infoUmum";
import BreadcrumbNav from "@/components/Breadcrumb/BreadcrumbNav";
import styles from "./InfoDetail.module.scss";

interface InfoDetailProps {
    post: InfoMeta;
    Content: ComponentType;
}

export default function InfoDetail({ post, Content }: InfoDetailProps) {
    const t = useTranslations();

    const related = infoList.filter((item) => item.id !== post.id).slice(0, 3);

    const breadcrumbs = [
        {
            label: t("common.home"),
            href: "/",
        },
        {
            label: t("common.generalInformation"),
            href: "/info-umum",
        },
        {
            label: t(post.titleKey),
        },
    ];

    return (
        <main className={styles.page}>
            <section className={styles.topbar}>
                <BreadcrumbNav
                    items={breadcrumbs}
                    className={styles.breadcrumb}
                />

                <div className={styles.badge}>
                    {t("common.generalInformation")}
                </div>

                <h1 className={styles.title}>{t(post.titleKey)}</h1>

                <p className={styles.excerpt}>{t(post.excerptKey)}</p>
            </section>

            <article className={styles.article}>
                <div className={styles.contentCard}>
                    <Content />
                </div>
            </article>

            {!!related.length && (
                <section className={styles.related}>
                    <div className={styles.relatedInner}>
                        <h2 className={styles.relatedHeading}>
                            {t("common.relatedInformation")}
                        </h2>

                        <div className={styles.relatedGrid}>
                            {related.map((item) => (
                                <Link
                                    key={item.id}
                                    href={item.detailLink}
                                    className={styles.relatedCard}
                                >
                                    <div className={styles.relatedImageWrap}>
                                        <Image
                                            src={item.image}
                                            alt={t(item.titleKey)}
                                            width={800}
                                            height={500}
                                            className={styles.relatedImage}
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        />
                                    </div>

                                    <div className={styles.relatedContent}>
                                        <p className={styles.relatedTitle}>
                                            {t(item.titleKey)}
                                        </p>

                                        <span className={styles.relatedCta}>
                                            {t("common.readMore")} →
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        <div className={styles.relatedFooter}>
                            <Link
                                href="/info-umum"
                                className={styles.backToInfoBtn}
                            >
                                ← {t("common.backToGeneralInformation")}
                            </Link>
                        </div>
                    </div>
                </section>
            )}
        </main>
    );
}
