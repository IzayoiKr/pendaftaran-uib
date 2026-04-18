import { features } from '@/constants/data';
import { featureIconMap } from '@/components/Icons';
import styles from './Feature.module.scss';

function FeatureCard() {
    return (
        <div className={styles.stack}>
            {features.map((feature) => (
                <div key={feature.icon} className={styles.card}>
                    <div className={styles.icon}>
                        {featureIconMap[feature.icon]}
                    </div>
                    <h3>{feature.title}</h3>
                    <p>
                        {feature.description}
                        <a href={feature.link} target='_blank' rel='noopener noreferrer'>Selengkapnya</a>
                    </p>
                </div>
            ))}
        </div>
    );
};

export default function Feature() {
    return (
        <section className={styles.feature}>
            <div className={styles.container}>
                <h2>Awesome Feature</h2>
                <FeatureCard />
            </div>
        </section>
    );
};
