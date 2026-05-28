// frontend/src/pages/InfoUmum/InfoDetails/ujian-saringan-masuk.tsx
import styles from "../InfoDetail.module.scss";

export const toc = [
    {
        id: "tahapan-ujian",
        label: "Tahapan Ujian",
    },
    {
        id: "ketentuan-offline",
        label: "Ketentuan Offline",
    },
    {
        id: "ketentuan-online",
        label: "Ketentuan Online",
    },
];

export default function UjianSaringanMasuk() {
    return (
        <>
            {/* INDONESIA */}
            <section id="ujian-saringan-masuk-indonesia">
                <h2>Ujian Saringan Masuk Mahasiswa Baru Program Sarjana</h2>

                <p>
                    Setiap calon pendaftar Jalur Beasiswa dan Reguler wajib
                    mengikuti tes Ujian Saringan Masuk yang diselenggarakan oleh
                    Universitas Internasional Batam.
                </p>

                <p>
                    Adapun tahapan, ketentuan, serta prosedur Ujian Saringan
                    Masuk adalah sebagai berikut:
                </p>

                {/* TAHAPAN */}
                <section id="tahapan-ujian">
                    <h3>Tahapan Ujian Saringan Masuk</h3>

                    <p>
                        Ujian Saringan Masuk Universitas Internasional Batam
                        terdiri dari:
                    </p>

                    <ol>
                        <li>
                            Computer Based Test atau Ujian Tes Potensi Akademik
                            (Matematika, Bahasa Indonesia, dan Bahasa Inggris).
                            <p>Waktu pengerjaan adalah 90 – 120 menit.</p>
                        </li>

                        <li>
                            Interview atau Tes Wawancara dengan Dosen
                            Universitas Internasional Batam.
                            <p>Wawancara dilakukan dalam waktu 5 – 10 menit.</p>
                        </li>
                    </ol>
                </section>

                {/* OFFLINE */}
                <section id="ketentuan-offline">
                    <h3>
                        Ketentuan Mengikuti Ujian Saringan Masuk Secara Offline
                    </h3>

                    <ol>
                        <li>
                            Memakai kemeja putih, celana hitam (selain bahan
                            jeans) dan sepatu;
                        </li>

                        <li>
                            Membawa Kartu Identitas Diri seperti: KTP/Kartu
                            Pelajar/Paspor/SIM.
                        </li>

                        <li>
                            Pengumuman hasil Ujian Saringan Masuk adalah 2 hari
                            setelah pelaksanaan ujian dan dapat dilihat pada
                            website resmi dan media sosial Universitas
                            Internasional Batam.
                        </li>
                    </ol>
                </section>

                {/* ONLINE */}
                <section id="ketentuan-online">
                    <h3>
                        Ketentuan Mengikuti Ujian Saringan Masuk Secara Online
                    </h3>

                    <ol>
                        <li>Mengenakan pakaian yang sopan;</li>

                        <li>
                            Mengikuti prosedur pelaksanaan ujian online (uji
                            coba sistem, wawancara online, dan tes tertulis
                            online).
                            <p>
                                Panduan prosedur akan diberikan oleh panitia
                                pada H-1 pelaksanaan ujian online.
                            </p>
                        </li>

                        <li>
                            Pengumuman hasil Ujian Saringan Masuk adalah 2 hari
                            setelah pelaksanaan ujian dan dapat dilihat pada
                            website resmi dan media sosial Universitas
                            Internasional Batam.
                        </li>
                    </ol>
                </section>
            </section>

            {/* LANGUAGE DIVIDER */}
            <div className={styles.langDivider}>
                <span className={styles.langLabel}>English Version</span>
            </div>

            {/* ENGLISH */}
            <section id="ujian-saringan-masuk-english">
                <h2>Entrance Examination for New Undergraduate Students</h2>

                <p>
                    Every prospective applicant for the Scholarship and Regular
                    Batch is required to take the Admission Test held by
                    Universitas Internasional Batam.
                </p>

                <p>
                    The stages, conditions, and procedures for the Entrance
                    Examination are as follows:
                </p>

                {/* STAGES */}
                <section id="entrance-exam-stages">
                    <h3>The Stages of the Entrance Examination</h3>

                    <p>
                        The stages for the Entrance Examination for Universitas
                        Internasional Batam consist of:
                    </p>

                    <ol>
                        <li>
                            Computer Based Test or Academic Potential Test
                            (Mathematics, Indonesian, and English).
                            <p>Test time is 90 - 120 minutes.</p>
                        </li>

                        <li>
                            Interview Test with Universitas Internasional Batam
                            Lecturers.
                            <p>
                                Interviews are conducted within 5 - 10 minutes.
                            </p>
                        </li>
                    </ol>
                </section>

                {/* OFFLINE */}
                <section id="offline-exam-conditions">
                    <h3>Conditions for Taking the Offline Admission Test</h3>

                    <ol>
                        <li>
                            Wearing a white shirt, black pants (other than
                            jeans) and shoes;
                        </li>

                        <li>
                            Bring Personal Identity Cards such as: KTP / Student
                            Card / Passport / SIM.
                        </li>

                        <li>
                            Announcement of the results of the Entrance
                            Examination is 2 days after the implementation of
                            the exam and can be seen on the official website and
                            social media of Universitas Internasional Batam.
                        </li>
                    </ol>
                </section>

                {/* ONLINE */}
                <section id="online-exam-conditions">
                    <h3>Conditions for Taking the Online Admission Test</h3>

                    <ol>
                        <li>Wearing polite clothing;</li>

                        <li>
                            Follow the procedures for conducting online exams
                            (system trial, online interview, and online written
                            test).
                            <p>
                                The procedure guide will be provided by the
                                committee on the day before the online exam.
                            </p>
                        </li>

                        <li>
                            Announcement of the results of the Entrance
                            Examination is 2 days after the implementation of
                            the exam and can be seen on the official website and
                            social media of Universitas Internasional Batam.
                        </li>
                    </ol>
                </section>
            </section>
        </>
    );
}
