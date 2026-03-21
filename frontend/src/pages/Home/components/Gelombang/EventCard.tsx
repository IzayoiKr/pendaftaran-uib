import type { FC } from 'react';
import type { Event } from '../../../../types';
import styles from './EventCard.module.scss';

interface Props {
    event: Event;
}

const EventCard: FC<Props> = ({ event }) => {
    const [day = '', month = ''] = event.date.split(' ');

    return (
        <div className={styles.card}>
            <div className={styles.image}>
                <img src={event.image} alt={event.batchName} />
            </div>
            <div className={styles.details}>
                <h4 className={styles.type}>
                    Ujian Saringan Masuk <br />
                    <i>Admission Test</i>
                </h4>
                <h4 className={styles.program}>
                    {event.programType} <br /><i>{event.programTypeEn}</i>
                </h4>
                <h5 className={styles.year}>{event.academicYear}</h5>
                <div className={styles.meta}>
                    <div className={styles.date}>
                        <span>{day}</span> {month}
                    </div>
                    <div className={styles.timeLocation}>
                        <p><span className="ti-time mr-2"></span> {event.time}</p>
                        <p><span className="ti-location-pin mr-2"></span> {event.location}</p>
                    </div>
                </div>
                <p className={styles.batch}>
                    Gelombang (<i>Batch</i>) : {event.batchName}
                </p>
                <p className={styles.regDate}>
                    Tanggal Pendaftaran (<i>Registration date</i>) : {event.registrationStart} s.d. {event.registrationEnd}
                </p>
                <a href={event.registerLink} className={styles.registerBtn}>Daftar (Register)</a>
            </div>
        </div>
    );
};

export default EventCard;
