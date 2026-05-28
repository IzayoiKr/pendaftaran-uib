"use client";

import { useEffect } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useScrollSpyContext } from "@/providers/ScrollSpyProvider";
import { gelombangIconMap } from "@/components/Icons/Icons";
import type { Event } from "@/types/api";
import styles from "./Gelombang.module.scss";

interface GelombangProps {
    events: Event[];
}

interface EventCardProps {
    event: Event;
}

function EventCard({ event }: EventCardProps) {
    return (
        <article className={styles.card}>
            <div className={styles.media}>
                <Image
                    src={event.image_path}
                    alt={event.batch_name}
                    fill
                    sizes="(max-width: 992px) 100vw, 50vw"
                    className={styles.image}
                />
            </div>

            <div className={styles.body}>
                <h3 className={styles.batch}>{event.batch_name}</h3>
                <p className={styles.program}>
                    {event.degree === "S1"
                        ? "Program Sarjana"
                        : "Program Magister"}
                    <br />
                    <i>
                        {event.degree === "S1"
                            ? "Undergraduate Program"
                            : "Magister Program"}
                    </i>
                </p>
                <p className={styles.year}>{event.academic_year}</p>

                <div className={styles.meta}>
                    <div className={styles.calendar}>
                        <span className={styles.calendarDay}>{event.day}</span>
                        <span className={styles.calendarMonth}>
                            {event.month}
                        </span>
                    </div>
                    <div className={styles.info}>
                        <p className={styles.infoRow}>
                            {gelombangIconMap.Clock}
                            <time dateTime={event.start_time}>
                                {event.start_time}
                            </time>
                            {" - "}
                            <time dateTime={event.end_time}>
                                {event.end_time}
                            </time>
                        </p>
                        <p className={styles.infoRow}>
                            {gelombangIconMap.Pin} {event.location}
                        </p>
                    </div>
                </div>

                <p className={styles.registration}>
                    <span className={styles.registrationLabel}>
                        Tanggal Pendaftaran (<i>Registration date</i>):
                    </span>
                    <br />
                    <time dateTime={event.registration_start}>
                        {event.registration_start_display}
                    </time>
                    {" s.d. "}
                    <time dateTime={event.registration_end}>
                        {event.registration_end_display}
                    </time>
                </p>

                <Link
                    href={`/registration/${event.batch_key}`}
                    className={styles.registerBtn}
                >
                    Daftar (Register)
                </Link>
            </div>
        </article>
    );
}

export default function Gelombang({ events }: GelombangProps) {
    const { notify } = useScrollSpyContext();
    useEffect(() => {
        notify();
    }, [notify]);

    return (
        <section className={styles.gelombang} id="gelombang">
            <div className={styles.container}>
                <div className={styles.title}>
                    <h2>Gelombang Pendaftaran</h2>
                    <h2 className={styles.subTitle}>
                        <i>Registration Batch</i>
                    </h2>
                    <p>
                        Informasi Jadwal Penerimaan Mahasiswa Baru
                        <br />
                        <i>New Student Admission Schedule Information</i>
                    </p>
                </div>

                <div className={styles.stack}>
                    {events.map((event) => (
                        <EventCard key={event.id} event={event} />
                    ))}
                </div>
            </div>
        </section>
    );
}
