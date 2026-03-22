import { useState, type FC } from 'react';
import type { Program } from '../../../types';
import styles from './ProgramCard.module.scss';

interface Props {
    program: Program;
}

const ProgramCard: FC<Props> = ({ program }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className={styles.card}>
            <img src={program.image} alt={program.title} />
            <div className={styles.content}>
                <span className={styles.degree}>{program.degree}</span>
                <span className={styles.faculty}>{program.faculty}</span>
                <h3>
                    <a href={program.link} target="_blank" rel="noopener noreferrer">
                        {program.title}
                    </a>
                </h3>
                <p className={expanded ? styles.expanded : ''}>
                    {program.description}
                </p>
                <div
                    className={styles.toggleBtn}
                    onClick={() => setExpanded(prev => !prev)}
                >
                    {expanded ? 'Tutup' : 'Detail'}
                </div>
            </div>
        </div>
    );
};

export default ProgramCard;
