import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { useCallback, useEffect, useState, useRef, memo } from 'react';
import { programs } from '../../../constants/data';
import styles from './ProgramStudi.module.scss';

interface ProgramCardProps {
    title: string;
    faculty: string;
    degree: 'S1' | 'S2';
    description: string;
    image: string;
    imageWebp: string;
    imageAvif: string;
    link: string
}

const ProgramCard = memo(function ProgramCard({ title, faculty, degree, description, image, imageWebp, imageAvif, link }: ProgramCardProps) {
    return (
        <div className={styles.card}>
            <div className={styles.courseHead}>
                <picture>
                    <source srcSet={imageAvif} type='image/avif' />
                    <source srcSet={imageWebp} type='image/webp' />
                    <img
                        src={image}
                        alt={title}
                        loading='lazy'
                        width='1080'
                        height='849'
                    />
                </picture>
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

const DotButton = memo(function DotButton({ active, onClick }: { active: boolean; onClick: () => void }) {
    return (
        <button
            className={`${styles.dot} ${active ? styles.dotActive : ''}`}
            onClick={onClick}
            aria-label={active ? 'Current slide' : 'Go to slide'}
        />
    );
})

export default function ProgramStudi() {
    const autoplay = useRef(Autoplay({ delay: 4000, stopOnInteraction: false, stopOnMouseEnter: true }));

    const [emblaRef, emblaApi] = useEmblaCarousel(
        { loop: true, align: 'start', slidesToScroll: 1 },
        [autoplay.current]
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

    const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
    const scrollTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi]);

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
                                        image={program.image}
                                        imageWebp={program.imageWebp}
                                        imageAvif={program.imageAvif}
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
