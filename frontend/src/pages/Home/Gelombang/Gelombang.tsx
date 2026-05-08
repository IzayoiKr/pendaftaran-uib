'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Event } from '@/types/api';
import { gelombangIconMap } from '@/components/Icons/Icons';
import styles from './Gelombang.module.scss';

interface GelombangProps { events: Event[] }

interface EventCardProps { event: Event }

function EventCard({ event }: EventCardProps) {
    return (
        <div className={styles.card}>
            <Image
                className={styles.cardImg}
                src={event.image_path}
                alt={event.id}
                fill
                sizes='(max-width: 992px) 100vw, 50vw'
                loading='lazy'
            />
            <div className={styles.details}>
                <h3>
                    Ujian Saringan Masuk <br />
                    <i>Admission Test</i>
                </h3>
                <h4>
                    {event.program_type} <br />
                    <i>{event.program_type_en}</i>
                </h4>
                <h5>{event.academic_year}</h5>

                <div className={styles.meta}>
                    <div className={styles.date}>
                        <span>{event.day}</span>
                        {event.month}
                    </div>
                    <div className={styles.timeLocation}>
                        <p>
                            {gelombangIconMap.Clock}
                            {' '}
                            <time dateTime={event.start_time}>{event.start_time}</time>
                            {' - '}
                            <time dateTime={event.end_time}>{event.end_time}</time>
                        </p>
                        <p>{gelombangIconMap.Pin} {event.location}</p>
                    </div>
                </div>
                <p className={styles.batch}>
                    <span>Gelombang (<i>Batch</i>):</span>
                    <br />
                    {event.batch_name}
                </p>
                <p className={styles.regDate}>
                    <span>Tanggal Pendaftaran (<i>Registration date</i>):</span>
                    <br />
                    <time dateTime={event.registration_start}>{event.registration_start_display}</time>
                    {' s.d. '}
                    <time dateTime={event.registration_end}>{event.registration_end_display}</time>
                </p>
                {  /* TODO: replace the registerLink later with backend token */}
                {
                    event.register_link && event.register_link.startsWith('http') ? (
                        <a
                            href={event.register_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.registerBtn}
                        >
                            Daftar (Register)
                        </a>
                    ) : (
                        <Link
                            href={`/batch-registration/${event.batch_key}`}
                            className={styles.registerBtn}
                        >
                            Daftar (Register)
                        </Link>
                    )
                }
            </div>
        </div>
    );
};

export default function Gelombang({ events }: GelombangProps) {
    return (
        <section className={styles.gelombang} id='gelombang'>
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
