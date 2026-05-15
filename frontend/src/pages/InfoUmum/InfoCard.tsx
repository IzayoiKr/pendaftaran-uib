"use client";

import Link from "next/link";
import Image from "next/image";

import type { InfoMeta } from "@/constants/infoUmum";

import styles from "./InfoCard.module.scss";

interface InfoCardProps {
  post: InfoMeta;
}

export default function InfoCard({
  post,
}: InfoCardProps) {
  return (
    <Link
      href={post.detailLink}
      className={styles.card}
      aria-label={post.titleId}
    >
      <div className={styles.imageWrap}>
        <Image
          src={post.image}
          alt={post.titleId}
          fill
          className={styles.image}
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      <div className={styles.body}>
        <h2 className={styles.title}>
          {post.titleId}
        </h2>

        <p className={styles.description}>
          {post.excerpt}
        </p>

        <span
          className={styles.cta}
          aria-hidden="true"
        >
          Baca Selengkapnya

          <svg
            className={styles.arrow}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </Link>
  );
}