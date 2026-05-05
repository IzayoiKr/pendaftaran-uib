'use client';

import Link from 'next/link';
import Image from 'next/image';
import styles from './Hero.module.scss';
import { heroes } from '@/constants/data';
import scrollToId from '@/components/ScrollToId';

interface handleClickProps {
    e: React.MouseEvent<HTMLAnchorElement>,
    hashId: string
}

const handleClick = ({ e, hashId }: handleClickProps) => {
    if (hashId && window.location.pathname === '/') {
        e.preventDefault();
        scrollToId(hashId)
    }
}

function HeroPicture() {
    return (
        <Image
            src='/images/hero-bg.jpg'
            width={1920}
            height={1000}
            alt='A group of international students gathering'
            priority
            fetchPriority='high'
        />
    )
}

function Content() {
    return (
        <div className={styles.content}>
            <h1>{heroes.title}</h1>
            <p>{heroes.description}</p>
        </div>
    )
}

function HeroButtons() {
    return (
        <div className={styles.heroButtons}>
            <Link
                href="#gelombang"
                className={styles.btnPrimary}
                onClick={(e) => handleClick({ e: e, hashId: "gelombang" })}
            >
                {heroes.registrationButtonDesc}
            </Link>
            <Link
                href="#program"
                className={styles.btnSecondary}
                onClick={(e) => handleClick({ e: e, hashId: "program" })}
            >
                {heroes.academicButtonDesc}
            </Link>
        </div>
    )
}

export default function Hero() {
    return (
        <section id="home" className={styles.hero}>
            <HeroPicture />
            <div className={styles.container}>
                <Content />
                <HeroButtons />
            </div>
        </section>
    );
}
