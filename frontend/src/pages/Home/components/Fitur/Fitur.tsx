import type { FC } from 'react';
import FeatureCard from './FeatureCard';
import { features } from '../../../../constants/data';
import styles from './Fitur.module.scss';

const Fitur: FC = () => {
    return (
        <section className={styles.fitur}>
            <div className="container">
                <div className={styles.title}>
                    <h2>Awesome Feature</h2>
                </div>
                <div className={styles.grid}>
                    {features.map(feature => (
                        <FeatureCard key={feature.id} feature={feature} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Fitur;

