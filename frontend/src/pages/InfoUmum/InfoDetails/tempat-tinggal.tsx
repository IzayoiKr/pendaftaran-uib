// frontend/src/pages/InfoUmum/InfoDetails/tempat-tinggal.tsx
import Image from "next/image";
import styles from "../InfoDetail.module.scss";

export const toc = [
    {
        id: "informasi-asrama-uib",
        label: "Informasi Asrama",
    },
    {
        id: "galeri-asrama",
        label: "Galeri Asrama",
    },
    {
        id: "tempat-tinggal-english",
        label: "English Version",
    },
];

export default function TempatTinggal() {
    return (
        <>
            {/* INDONESIA */}
            <section id="tempat-tinggal-indonesia">
                <h2>
                    Informasi Tempat Tinggal Terdekat Mahasiswa Universitas
                    Internasional Batam
                </h2>

                <section id="informasi-asrama-uib">
                    <h3>Informasi Asrama UIB</h3>

                    <p>
                        Asrama Universitas Internasional Batam mulai beroperasi
                        sejak tahun 2019 dengan 1 (satu) gedung utama dan
                        kapasitas hunian sebanyak 96 mahasiswa perempuan dan 104
                        mahasiswa laki-laki.
                    </p>

                    <p>
                        Asrama dirancang untuk memberikan lingkungan tempat
                        tinggal yang aman, nyaman, dan mendukung aktivitas
                        akademik mahasiswa selama menempuh pendidikan di UIB.
                    </p>

                    <p>
                        Bagi calon mahasiswa yang berminat untuk menempati
                        dormitori UIB, silakan menghubungi WhatsApp Humas UIB di{" "}
                        <strong>0812-7526-2369</strong>.
                    </p>
                </section>

                {/* GALLERY */}
                <section id="galeri-asrama">
                    <h3>Galeri Asrama</h3>

                    <div className={styles.galleryGrid}>
                        {/* CARD 1 */}
                        <div className={styles.galleryCard}>
                            <div className={styles.galleryImageWrap}>
                                <Image
                                    src="/images/infoumum/asrama2.png"
                                    alt="Kamar Asrama Universitas Internasional Batam"
                                    fill
                                    className={styles.galleryImage}
                                />
                            </div>

                            <div className={styles.galleryBody}>
                                <h4>Kamar Asrama</h4>

                                <p>
                                    Fasilitas kamar dilengkapi tempat tidur
                                    bertingkat, meja belajar, kursi, dan lemari
                                    penyimpanan untuk mendukung kenyamanan
                                    mahasiswa.
                                </p>
                            </div>
                        </div>

                        {/* CARD 2 */}
                        <div className={styles.galleryCard}>
                            <div className={styles.galleryImageWrap}>
                                <Image
                                    src="/images/infoumum/asrama1.png"
                                    alt="Lingkungan Asrama Universitas Internasional Batam"
                                    fill
                                    className={styles.galleryImage}
                                />
                            </div>

                            <div className={styles.galleryBody}>
                                <h4>Lingkungan Asrama</h4>

                                <p>
                                    Area asrama memiliki lingkungan yang bersih,
                                    tertata, serta mendukung aktivitas dan
                                    interaksi mahasiswa selama tinggal di Batam.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </section>

            {/* LANGUAGE DIVIDER */}
            <div className={styles.langDivider}>
                <span className={styles.langLabel}>English Version</span>
            </div>

            {/* ENGLISH */}
            <section id="tempat-tinggal-english">
                <h2>UIB Dormitory Information</h2>

                <p>
                    The Universitas Internasional Batam Dormitory has been
                    operating since 2019 with one main building and a
                    residential capacity of 96 female students and 104 male
                    students.
                </p>

                <p>
                    The dormitory is designed to provide a safe, comfortable,
                    and supportive living environment for students during their
                    study period at UIB.
                </p>

                <p>
                    Prospective students who are interested in staying at the
                    UIB dormitory may contact the UIB Public Relations WhatsApp
                    number at <strong>0812-7526-2369</strong>.
                </p>
            </section>
        </>
    );
}
