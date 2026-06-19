import { useTranslations } from "next-intl";
import styles from "../InfoDetail.module.scss";

type VideoTutorialData = {
    title: string;
    url: string;
    link: string;
    linkLabel: string;
};

export default function VideoTutorial() {
    const t = useTranslations("infoDetails.videoTutorial");

    const video = t.raw("video") as VideoTutorialData;

    return (
        <section id="video-tutorial">
            <h2>{t("heading")}</h2>

            <p>{t("description")}</p>

            <div className={styles.videoWrapper}>
                <iframe
                    src={video.url}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                />
            </div>

            <div className={styles.callout}>
                <strong>{t("callout.heading")}:</strong>

                <p>
                    <a
                        href={video.link}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {video.linkLabel}
                    </a>
                </p>
            </div>
        </section>
    );
}
