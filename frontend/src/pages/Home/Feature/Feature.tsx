import { features } from '../../../constants/data';
import styles from './Feature.module.scss';

function FeatureCard() {
    return (
        <div className={styles.stack}>
            {features.map((feature) => (
                <div key={feature.id} className={styles.card}>
                    <div className={styles.icon}>
                        {feature.icon} 
                    </div>
                    <h4>{feature.title}</h4>
                    <p>{feature.description}</p>
                    <a href={feature.link} className={styles.link}>Selengkapnya</a>
                </div>
            ))}
        </div>
    );
};

export default function Feature() {
    return (
        <section className={styles.feature}>
            <div className={styles.container}>
                <div className={styles.title}>
                    <h2>Awesome Feature</h2>
                </div>
                <FeatureCard />
            </div>
        </section>
    );
};
