import { Link } from 'react-router-dom';
import styles from './Hero.module.scss';
import { heroes } from '../../data';

function Content() {
    return (
        <div className={styles.content}>
            <h1>{heroes.title}</h1>
            <p>{heroes.description}</p>
        </div>
    )
}

function RegistrationButton() {
    return (
        <div className={styles.heroButtons}>
            <Link to="#gelombang" className={styles.btnPrimary}>{heroes.registrationButtonDesc}</Link>
            <Link to="#program" className={styles.btnSecondary}>{heroes.academicButtonDesc}</Link>
        </div>
    )
}

export default function Hero() {
    return (
        <section className={styles.hero}>
            <div className={styles.container}>
                <Content />
                <RegistrationButton />
            </div>
        </section>
    );
}

