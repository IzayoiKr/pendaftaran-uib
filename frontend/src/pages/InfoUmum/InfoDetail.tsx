import Link from "next/link";
import type { ComponentType } from "react";

import type { InfoMeta } from "@/constants/infoUmum";
import { infoList } from "@/constants/infoUmum";

import BreadcrumbNav from "@/components/Breadcrumb/BreadcrumbNav";

import styles from "./InfoDetail.module.scss";
import TocNav from "./TocNav";

interface TocItem {
  id: string;
  label: string;
}

interface InfoDetailProps {
  post: InfoMeta;
  Content: ComponentType;
  toc?: TocItem[];
}

export default function InfoDetail({
  post,
  Content,
  toc = [],
}: InfoDetailProps) {
  const related = infoList
    .filter((p) => p.id !== post.id)
    .slice(0, 3);

  const breadcrumbs = [
    { label: "Beranda", href: "/" },
    {
      label: "Informasi Umum",
      href: "/info-umum",
    },
    { label: post.titleId },
  ];

  return (
    <main className={styles.page}>
      <section className={styles.topbar}>
        <BreadcrumbNav
          items={breadcrumbs}
          className={styles.breadcrumb}
        />

        <div className={styles.badge}>
          Informasi Umum
        </div>

        <h1 className={styles.title}>
          {post.titleId}
        </h1>

        <p className={styles.excerpt}>
          {post.excerpt}
        </p>

        {toc.length > 0 && (
          <TocNav toc={toc} />
        )}
      </section>

      <article className={styles.article}>
        <div className={styles.contentCard}>
          <Content />
        </div>
      </article>

      {related.length > 0 && (
        <section className={styles.related}>
          <div className={styles.relatedInner}>
            <h2 className={styles.relatedHeading}>
              Informasi Lainnya
            </h2>

            <div className={styles.relatedGrid}>
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={item.detailLink}
                  className={styles.relatedCard}
                >
                  <div className={styles.relatedImageWrap}>
                    <img
                      src={item.image}
                      alt={item.titleId}
                      className={styles.relatedImage}
                      loading="lazy"
                    />
                  </div>

                  <div className={styles.relatedContent}>
                    <p className={styles.relatedTitle}>
                      {item.titleId}
                    </p>

                    <span className={styles.relatedCta}>
                      Baca Selengkapnya →
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
                ← Kembali ke Informasi Umum
              </Link>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}