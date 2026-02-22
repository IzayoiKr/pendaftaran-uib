import type { FC } from 'react';
import type { Feature } from '../../../../types';
import styles from './FeatureCard.module.scss';

interface Props {
    feature: Feature;
}

const FeatureCard: FC<Props> = ({ feature }) => {
    return (
        <div className={styles.card}>
            <div className={styles.icon}>
                <span className={feature.icon}></span>
            </div>
            <h4>{feature.title}</h4>
            <p>{feature.description}</p>
            <a href={feature.link} className={styles.link}>Selengkapnya</a>
        </div>
    );
};

export default FeatureCard;

