import type { Event } from '../../../types';
import { events } from '../../../constants/data';
import { gelombangIconMap } from '../../../components/Icons';
import { Link } from 'react-router-dom';
import styles from './Gelombang.module.scss';

interface EventCardProps {
    event: Event
}

function EventCard({ event }: EventCardProps) {
    return (
        <div className={styles.card}>
            <picture>
                <source srcSet={event.imageAvif} type='image/avif' />
                <source srcSet={event.imageWebp} type='image/webp' />
                <img
                    src={event.image}
                    alt={event.id}
                    loading='lazy'
                    width='555'
                    height='400'
                />
            </picture>
            <div className={styles.details}>
                <h3>
                    Ujian Saringan Masuk <br />
                    <i>Admission Test</i>
                </h3>
                <h4>
                    {event.programType} <br />
                    <i>{event.programTypeEn}</i>
                </h4>
                <h5>{event.academicYear}</h5>

                <div className={styles.meta}>
                    <div className={styles.date}>
                        <span>{event.day}</span>
                        {event.month}
                    </div>
                    <div className={styles.timeLocation}>
                        <p>
                            {gelombangIconMap.Clock}
                            {' '}
                            <time dateTime={event.startTime}>{event.startTime}</time>
                            {' - '}
                            <time dateTime={event.endTime}>{event.endTime}</time>
                        </p>
                        <p>{gelombangIconMap.Pin} {event.location}</p>
                    </div>
                </div>
                <p className={styles.batch}>
                    <span>Gelombang (<i>Batch</i>):</span>
                    <br />
                    {event.batchName}
                </p>
                <p className={styles.regDate}>
                    <span>Tanggal Pendaftaran (<i>Registration date</i>):</span>
                    <br />
                    <time dateTime={event.registrationStart}>{event.registrationStart}</time>
                    {' s.d. '}
                    <time dateTime={event.registrationEnd}>{event.registrationEnd}</time>
                </p>
                {event.registerLink && event.registerLink.startsWith('http') ? (
                    <a
                        href={event.registerLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.registerBtn}
                    >
                        Daftar (Register)
                    </a>
                ) : (
                    <Link
                        to={`/register/${event.id}`}
                        className={styles.registerBtn}
                    >
                        Daftar (Register)
                    </Link>
                )}
            </div>
        </div>
    );
};

export default function Gelombang() {
    return (
        <section className={styles.gelombang} id="gelombang">
            <div className={styles.container}>
                <div className={styles.title}>
                    <h2>Gelombang Pendaftaran</h2>
                    <h2 className={styles.subTitle}><i>Registration Batch</i></h2>
                    <p>
                        Informasi Jadwal Penerimaan Mahasiswa Baru
                        <br />
                        <i>New Student Admission Schedule Information</i>
                    </p>
                </div>
                <div className={styles.stack}>
                    {events.map(event => (
                        <EventCard key={event.id} event={event} />
                    ))}
                </div>
            </div>
        </section>
    );
};
