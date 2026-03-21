import type { FC } from 'react';
import EventCard from './EventCard';
import { events } from '../../../../constants/data';
import styles from './Gelombang.module.scss';

const Gelombang: FC = () => {
    return (
        <section className={styles.gelombang} id="gelombang">
            <div className={styles.container}>
                <div className={styles.title}>
                    <h2>Gelombang Pendaftaran</h2>
                    <hr />
                    <h2 className={styles.sub}><i>Registration Batch</i></h2>
                    <p>Informasi Jadwal Penerimaan Mahasiswa Baru <br /><i>New Student Admission Schedule Information</i></p>
                </div>
                <div className={styles.grid}>
                    {events.map(event => (
                        <EventCard key={event.id} event={event} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Gelombang;