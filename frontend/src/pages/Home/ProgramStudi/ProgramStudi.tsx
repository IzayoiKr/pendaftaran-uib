import type { FC } from 'react';
import styles from './ProgramStudi.module.scss';
import ProgramSlider from '../../../components/PowerSlider/PowerSlider';

const ProgramStudi: FC = () => {
    return (
        <section className={styles.program} id="program">
            <div className={styles.container}>
                <div className={styles.title}>
                    <h2>Program Studi</h2>
                    <p>Program Sarjana dan Program Pasca Sarjana</p>
                </div>
            <ProgramSlider />
            </div>
        </section>
    );
};

export default ProgramStudi;