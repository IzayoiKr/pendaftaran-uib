import type { FC } from 'react';
import { Link } from 'react-router-dom';
import styles from './Hero.module.scss';

const Hero: FC = () => {
    return (
        <section className={styles.hero} id="home">
            <div className="container">
                <div className={styles.content}>
                    <h1>Welcome to Universitas Internasional Batam</h1>
                    <p>
                        University with international quality standard that produces graduates,
                        science, technology and arts that can meet global dynamic changes.
                    </p>
                    <div className={styles.buttons}>
                        <Link to="#gelombang" className="btn-primary">Pendaftaran (Registration)</Link>
                        <Link to="#program" className="btn-outline">Akademik (Academic)</Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Hero;

