'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import styles from './Hero.module.scss';
import scrollToId from '@/utils/ScrollToId';

interface handleClickProps {
    e: React.MouseEvent<HTMLAnchorElement>,
    hashId: string
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
            <h1>WELCOME TO UNIVERSITAS INTERNASIONAL BATAM</h1>
            <p>University with international quality standard that produces graduates, science, technology and arts that can meet global dynamic changes.</p>
        </div>
    )
}

function HeroButtons() {
    const pathname = usePathname();

    const handleClick = ({ e, hashId }: handleClickProps) => {
        if (hashId && pathname === '/') {
            e.preventDefault();
            scrollToId(hashId)
        }
    }

    return (
        <div className={styles.heroButtons}>
            <Link
                href="#gelombang"
                className={styles.btnPrimary}
                onClick={(e) => handleClick({ e: e, hashId: "gelombang" })}
            >
                PENDAFTARAN (REGISTRATION)
            </Link>
            <Link
                href="#program"
                className={styles.btnSecondary}
                onClick={(e) => handleClick({ e: e, hashId: "program" })}
            >
                AKADEMIK (ACADEMIC)
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
