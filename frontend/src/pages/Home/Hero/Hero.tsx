import { Link } from 'react-router-dom';
import styles from './Hero.module.scss';
import { heroes, getImg } from '../../../constants/data';
import scrollToId from '../../../components/ScrollToId';

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
        <picture>
            <source srcSet={getImg('hero-bg.avif')} type='image/avif' />
            <source srcSet={getImg('hero-bg.webp')} type='image/webp' />
            <img
                src={getImg('hero-bg.jpg')}
                alt='A group of international students gathering'
                fetchPriority='high'
            />
        </picture>
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
                to="#gelombang"
                className={styles.btnPrimary}
                onClick={(e) => handleClick({ e: e, hashId: "gelombang" })}
            >
                {heroes.registrationButtonDesc}
            </Link>
            <Link
                to="#program"
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
