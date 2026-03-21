import type { FC } from 'react';
import GuideVideo from './GuideVideo';
import styles from './Panduan.module.scss';

const Panduan: FC = () => {
    return (
        <section className={styles.panduan} id="panduan">
            <div className={styles.container}>
                <div className={styles.title}>
                    <h2>Guides</h2>
                </div>
                <div className={styles.grid}>
                    <GuideVideo
                        title="Student Admissions Guideline"
                        videoId="E3ez3tOA_D4"
                    />
                    <GuideVideo
                        title="Re-registration Guideline"
                        videoId="WWaq2Hs6kq0"
                    />
                </div>
            </div>
        </section>
    );
};

export default Panduan;
