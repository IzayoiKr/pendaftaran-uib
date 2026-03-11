import { Link } from 'react-router-dom';
import styles from './Hero.module.scss';

interface HeroProps {
    className?: string;
}

export default function Hero({ className }: HeroProps) {
    return (
        <section className={`${styles.hero} ${className}`}>
            <div className={styles.container}>
                <div className={styles.content}>
                    <h1>WELCOME TO UNIVERSITAS INTERNASIONAL BATAM</h1>
                    <p>
                        University with international quality standard that produces graduates,
                        science, technology and arts that can meet global dynamic changes.
                    </p>
                    <div className={styles.buttons}>
                        <Link to="#gelombang" className={styles.btnPrimary}>PENDAFTARAN (REGISTRATION)</Link>
                        <Link to="#program" className={styles.btnSecondary}>AKADEMIK (ACADEMIC)</Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

