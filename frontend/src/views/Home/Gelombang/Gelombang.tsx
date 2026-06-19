"use client";

import { memo, useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useScrollSpyContext } from "@/providers/ScrollSpyProvider";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { gelombangIconMap } from "@/components/Icons/Icons";
import type { Event } from "@/types/api";
import styles from "./Gelombang.module.scss";

interface GelombangProps {
    events: Event[];
}

interface EventCardProps {
    event: Event;
    t: (key: string, opts?: Record<string, string | number | Date>) => string;
}

const EventCard = memo(function EventCard({ event, t }: EventCardProps) {
    const registerLink =
        event.register_link || `/registration/${event.batch_key}`;
    const isExternalLink =
        typeof registerLink === "string" && registerLink.startsWith("http");

    const ctaContent = (
        <>
            {t("registerNow")}
            <span className={styles.ctaArrow} aria-hidden="true">
                →
            </span>
        </>
    );

    return (
        <article className={styles.card}>
            <div className={styles.cardInner}>
                <div className={styles.cardImageWrapper}>
                    <Image
                        src={event.image_path}
                        alt={event.batch_name}
                        fill
                        sizes="(max-width: 768px) 100vw, 920px"
                        className={styles.cardImage}
                        loading="lazy"
                    />
                    <div
                        className={styles.cardImageOverlay}
                        aria-hidden="true"
                    />
                    <div className={styles.cardImageTitle}>
                        <h3 className={styles.cardBatchName}>
                            <span>{event.batch_name}</span>
                            <span>
                                T.A {event.academic_year}/
                                {Number(event.academic_year) + 1}
                            </span>
                        </h3>
                    </div>
                </div>

                <div className={styles.cardBody}>
                    <div className={styles.examSection}>
                        <p className={styles.examSectionLabel}>
                            {t("examLabel")}
                        </p>
                        <div
                            className={styles.examDateRow}
                            aria-label={t("examAriaLabel", {
                                day: event.day,
                                month: event.month,
                            })}
                        >
                            <div className={styles.examCalendarBadge}>
                                <span className={styles.examCalendarMonth}>
                                    {event.month}
                                </span>
                                <span className={styles.examCalendarDay}>
                                    {event.day}
                                </span>
                            </div>
                            <div className={styles.examDetails}>
                                <p className={styles.examDetailRow}>
                                    {gelombangIconMap.Clock}
                                    <time dateTime={event.start_time}>
                                        {event.start_time}
                                    </time>
                                    {" – "}
                                    <time dateTime={event.end_time}>
                                        {event.end_time}
                                    </time>
                                </p>
                                <p className={styles.examDetailRow}>
                                    {gelombangIconMap.Pin}
                                    {event.location}
                                </p>
                            </div>
                        </div>
                    </div>

                    <hr className={styles.cardDivider} aria-hidden="true" />

                    <div className={styles.registrationSection}>
                        <p className={styles.registrationSectionLabel}>
                            {t("registrationLabel")}
                        </p>
                        <p className={styles.registrationDateRange}>
                            <time dateTime={event.registration_start}>
                                {event.registration_start_display}
                            </time>
                            <span>{t("dateSeparator")}</span>
                            <time dateTime={event.registration_end}>
                                {event.registration_end_display}
                            </time>
                        </p>
                    </div>

                    {isExternalLink ? (
                        <a
                            href={registerLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.ctaButton}
                        >
                            {ctaContent}
                        </a>
                    ) : (
                        <Link href={registerLink} className={styles.ctaButton}>
                            {ctaContent}
                        </Link>
                    )}
                </div>
            </div>
        </article>
    );
});

const DotButton = memo(function DotButton({
    active,
    onClick,
}: {
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            className={`${styles.dotItem} ${active ? styles.dotItemActive : ""}`}
            onClick={onClick}
            aria-label={active ? "Current slide" : "Go to slide"}
        />
    );
});

export default function Gelombang({ events }: GelombangProps) {
    const t = useTranslations("gelombang");
    const { notify } = useScrollSpyContext();

    const [autoplay] = useState(() =>
        Autoplay({
            delay: 6000,
            stopOnInteraction: false,
            stopOnMouseEnter: true,
        }),
    );

    const [emblaRef, emblaApi] = useEmblaCarousel(
        {
            align: "start",
            containScroll: "trimSnaps",
            dragFree: false,
            loop: false,
        },
        [autoplay],
    );

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

    useEffect(() => {
        notify();
    }, [notify]);

    useEffect(() => {
        if (!emblaApi) return;

        const onInit = () => setScrollSnaps(emblaApi.scrollSnapList());
        const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());

        onInit();
        onSelect();

        emblaApi.on("init", onInit).on("reInit", onInit).on("select", onSelect);

        return () => {
            emblaApi
                .off("init", onInit)
                .off("reInit", onInit)
                .off("select", onSelect);
        };
    }, [emblaApi]);

    const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
    const scrollTo = useCallback(
        (index: number) => emblaApi?.scrollTo(index),
        [emblaApi],
    );

    return (
        <section className={styles.section} id="gelombang">
            <div className={styles.sectionInner}>
                {/* Header */}
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>{t("title")}</h2>
                    <p className={styles.sectionDescription}>
                        <i>{t("description")}</i>
                    </p>
                </div>

                <div className={styles.carouselOuter}>
                    <button
                        type="button"
                        className={`${styles.navButton} ${styles.navButtonPrev}`}
                        onClick={scrollPrev}
                        aria-label="Previous batch"
                    >
                        ‹
                    </button>

                    <div className={styles.carouselViewport} ref={emblaRef}>
                        <div className={styles.carouselTrack}>
                            {events.map((event) => (
                                <div
                                    className={styles.carouselSlide}
                                    key={event.id}
                                >
                                    <EventCard event={event} t={t} />
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        type="button"
                        className={`${styles.navButton} ${styles.navButtonNext}`}
                        onClick={scrollNext}
                        aria-label="Next batch"
                    >
                        ›
                    </button>
                </div>

                <div className={styles.dotList}>
                    {scrollSnaps.map((_, index) => (
                        <DotButton
                            key={index}
                            active={index === selectedIndex}
                            onClick={() => scrollTo(index)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
