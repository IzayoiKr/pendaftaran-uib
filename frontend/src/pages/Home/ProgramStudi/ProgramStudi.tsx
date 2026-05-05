'use client';

import { useCallback, useEffect, useMemo, useState, memo } from 'react';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import type { Program } from '@/types';
import styles from './ProgramStudi.module.scss';

interface ProgramStudiProps { programs: Program[] }

interface ProgramCardProps {
    title: string;
    faculty: string;
    degree: 'S1' | 'S2';
    description: string;
    image: string;
    link: string
}

const ProgramCard = memo(function ProgramCard({ title, faculty, degree, description, image, link }: ProgramCardProps) {
    return (
        <div className={styles.card}>
            <div className={styles.courseHead}>
                <Image
                    src={image}
                    alt={title}
                    width={1080}
                    height={849}
                    sizes="(max-width: 768px) 100vw, (max-width: 992px) 50vw, (max-width: 1400px) 33vw, 25vw"
                    loading='lazy'
                />
            </div>
            <div className={styles.courseContent}>
                <span className={styles.badge}>{degree}</span>
                <span className={styles.tag}>{faculty}</span>
                <h3>
                    <a href={link} target="_blank" rel="noopener noreferrer">
                        {title}
                    </a>
                </h3>
                <p>{description}</p>
            </div>
        </div>
    );
})

function DotButton({ active, onClick }: { active: boolean; onClick: () => void }) {
    return (
        <button
            className={`${styles.dot} ${active ? styles.dotActive : ''}`}
            onClick={onClick}
            aria-label={active ? 'Current slide' : 'Go to slide'}
        />
    );
}

export default function ProgramStudi({ programs }: ProgramStudiProps) {
    const autoplay = useMemo(
        () => Autoplay({ delay: 4000, stopOnInteraction: false, stopOnMouseEnter: true }),
        []
    );

    const [emblaRef, emblaApi] = useEmblaCarousel(
        { loop: true, align: 'start', slidesToScroll: 1 },
        [autoplay]
    );

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

    const onInit = useCallback(() => {
        if (!emblaApi) return;
        setScrollSnaps(emblaApi.scrollSnapList());
    }, [emblaApi]);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);


    useEffect(() => {
        if (!emblaApi) return;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        onInit();
        onSelect();
        emblaApi.on('reInit', onInit);
        emblaApi.on('reInit', onSelect);
        emblaApi.on('select', onSelect);
        return () => {
            emblaApi.off('reInit', onInit);
            emblaApi.off('reInit', onSelect);
            emblaApi.off('select', onSelect);
        };
    }, [emblaApi, onInit, onSelect]);

    const scrollPrev = () => emblaApi?.scrollPrev();
    const scrollNext = () => emblaApi?.scrollNext();
    const scrollTo = (i: number) => emblaApi?.scrollTo(i);

    return (
        <section className={styles.programStudi} id="program">
            <div className={styles.container}>
                <div className={styles.sectionHeader}>
                    <h2>Program Studi</h2>
                    <p>Program Sarjana dan Program Pasca Sarjana</p>
                </div>

                <div className={styles.carouselWrapper}>

                    <button
                        className={`${styles.navBtn} ${styles.prev}`}
                        onClick={scrollPrev}
                        aria-label="Previous programs"
                    >‹</button>

                    <div className={styles.viewport} ref={emblaRef}>
                        <div className={styles.track}>
                            {programs.map(program => (
                                <div className={styles.slide} key={program.id}>
                                    <ProgramCard
                                        title={program.title}
                                        faculty={program.faculty}
                                        degree={program.degree}
                                        description={program.description}
                                        image={program.image_path}
                                        link={program.link}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        className={`${styles.navBtn} ${styles.next}`}
                        onClick={scrollNext}
                        aria-label="Next programs"
                    >›</button>

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
