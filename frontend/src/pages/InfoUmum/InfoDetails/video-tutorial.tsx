// frontend/src/pages/InfoUmum/InfoDetails/video-tutorial.tsx
import styles from "../InfoDetail.module.scss";

export const toc = [
    {
        id: "video-tutorial-indonesia",
        label: "Bahasa Indonesia",
    },
    {
        id: "video-tutorial-english",
        label: "English Version",
    },
];

export default function VideoTutorial() {
    return (
        <>
            {/* INDONESIA */}
            <section id="video-tutorial-indonesia">
                <h2>
                    Video Tutorial Pendaftaran Online Bagi Calon Mahasiswa
                    Universitas Internasional Batam
                </h2>

                <p>
                    Untuk panduan pendaftaran online, calon peserta dapat
                    mengakses video di bawah ini.
                </p>

                <div className={styles.videoWrapper}>
                    <iframe
                        src="https://www.youtube.com/embed/E3ez3tOA_D4"
                        title="Tutorial Pendaftaran Online Universitas Internasional Batam"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="strict-origin-when-cross-origin"
                    />
                </div>

                <div className={styles.callout}>
                    <strong>Tautan Video:</strong>

                    <p>
                        <a
                            href="https://youtu.be/E3ez3tOA_D4"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Tutorial Pendaftaran Online Bagi Calon Mahasiswa
                            Universitas Internasional Batam
                        </a>
                    </p>
                </div>
            </section>

            {/* LANGUAGE DIVIDER */}
            <div className={styles.langDivider}>
                <span className={styles.langLabel}>English Version</span>
            </div>

            {/* ENGLISH */}
            <section id="video-tutorial-english">
                <h2>
                    Online Registration Tutorial for Prospective Batam
                    International University Students
                </h2>

                <p>
                    For online registration guidelines, potential participants
                    can access the video below.
                </p>

                <div className={styles.videoWrapper}>
                    <iframe
                        src="https://www.youtube.com/embed/E3ez3tOA_D4"
                        title="Online Registration Tutorial for Prospective Batam International University Students"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="strict-origin-when-cross-origin"
                    />
                </div>

                <div className={styles.callout}>
                    <strong>Video Link:</strong>

                    <p>
                        <a
                            href="https://youtu.be/E3ez3tOA_D4"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Online Registration Tutorial for Prospective Batam
                            International University Students
                        </a>
                    </p>
                </div>
            </section>
        </>
    );
}
