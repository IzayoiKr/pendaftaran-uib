"use client";

import { memo, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import type { Program } from "@/types/api";
import styles from "./ProgramStudi.module.scss";

interface ProgramStudiProps {
    programs: Program[];
}

interface ProgramCardProps {
    title: string;
    faculty: string;
    degree: "S1" | "S2";
    description: string;
    image: string;
    link: string;
    expanded: boolean;
    onToggle: () => void;
    t: (key: string, opts?: Record<string, string | number | Date>) => string;
}

const ProgramCard = memo(function ProgramCard({
    title,
    faculty,
    degree,
    description,
    image,
    link,
    expanded,
    onToggle,
    t,
}: ProgramCardProps) {
    return (
        <article className={styles.card}>
            <div className={styles.courseHead}>
                <Image
                    src={image}
                    alt={title}
                    width={1080}
                    height={849}
                    sizes="(max-width:768px) 100vw,(max-width:992px) 50vw,(max-width:1400px) 33vw,25vw"
                    loading="lazy"
                />

                <div className={styles.imageOverlay} aria-hidden="true" />
            </div>

            <div className={styles.courseContent}>
                <span
                    className={`${styles.badge} ${
                        degree === "S2" ? styles.badgeS2 : styles.badgeS1
                    }`}
                    aria-label={t("degreeLabel", { degree })}
                >
                    {degree}
                </span>

                <span className={styles.tag}>{faculty}</span>

                <h3>
                    <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.titleLink}
                    >
                        {title}
                    </a>
                </h3>

                <div className={styles.description}>
                    <div
                        className={
                            expanded
                                ? styles.descriptionFull
                                : styles.descriptionClamp
                        }
                    >
                        {description}
                    </div>
                </div>

                <button
                    type="button"
                    className={styles.toggleBtn}
                    onClick={onToggle}
                    aria-expanded={expanded}
                >
                    {expanded ? t("toggleClose") : t("toggleDetail")}
                </button>
            </div>
        </article>
    );
});

function DotButton({
    active,
    onClick,
}: {
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            className={`${styles.dot} ${active ? styles.dotActive : ""}`}
            onClick={onClick}
            aria-label={active ? "Current slide" : "Go to slide"}
        />
    );
}

export default function ProgramStudi({ programs }: ProgramStudiProps) {
    const t = useTranslations("programStudi");
    const autoplay = Autoplay({
        delay: 4000,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
    });

    const [emblaRef, emblaApi] = useEmblaCarousel(
        {
            loop: true,
            align: "start",
            slidesToScroll: 1,
        },
        [autoplay],
    );

    const [selectedIndex, setSelectedIndex] = useState(0);

    const [expanded, setExpanded] = useState(false);

    const scrollSnaps = emblaApi?.scrollSnapList() ?? [];

    useEffect(() => {
        if (!emblaApi) return;

        const handleSelect = () => {
            setSelectedIndex(emblaApi.selectedScrollSnap());
        };

        handleSelect();

        emblaApi.on("select", handleSelect);

        return () => {
            emblaApi.off("select", handleSelect);
        };
    }, [emblaApi]);

    const scrollPrev = () => {
        emblaApi?.scrollPrev();
    };

    const scrollNext = () => {
        emblaApi?.scrollNext();
    };

    const scrollTo = (i: number) => {
        emblaApi?.scrollTo(i);
    };

    const toggleAllCards = () => {
        setExpanded((prev) => !prev);
    };

    return (
        <section className={styles.programStudi} id="program">
            <div className={styles.container}>
                <div className={styles.sectionHeader}>
                    <h2>{t("title")}</h2>

                    <p>{t("subtitle")}</p>
                </div>

                <div className={styles.carouselWrapper}>
                    <button
                        className={`${styles.navBtn} ${styles.prev}`}
                        onClick={scrollPrev}
                        aria-label="Previous programs"
                    >
                        ‹
                    </button>

                    <div className={styles.viewport} ref={emblaRef}>
                        <div className={styles.track}>
                            {programs.map((program) => (
                                <div className={styles.slide} key={program.id}>
                                    <ProgramCard
                                        title={program.title}
                                        faculty={program.faculty}
                                        degree={program.degree}
                                        description={program.description}
                                        image={program.image_path}
                                        link={program.link}
                                        expanded={expanded}
                                        onToggle={toggleAllCards}
                                        t={t}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        className={`${styles.navBtn} ${styles.next}`}
                        onClick={scrollNext}
                        aria-label="Next programs"
                    >
                        ›
                    </button>
                </div>

                <div className={styles.dots}>
                    {scrollSnaps.map((_, i) => (
                        <DotButton
                            key={i}
                            active={i === selectedIndex}
                            onClick={() => scrollTo(i)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
