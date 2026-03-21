import type { FC } from 'react';
import ProgramCard from './ProgramCard'
import { programs } from '../../../constants/data';
import styles from './ProgramStudi.module.scss';

const ProgramStudi: FC = () => {
    return (
        <section className={styles.program} id="program">
            <div className={styles.container}>
                <div className={styles.title}>
                    <h2>Program Studi</h2>
                    <p>Program Sarjana dan Program Pasca Sarjana</p>
                </div>
                <div className={styles.grid}>
                    {programs.map(program => (
                        <ProgramCard key={program.id} program={program} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ProgramStudi;

