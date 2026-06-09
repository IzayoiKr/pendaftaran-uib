import { useTranslations } from "next-intl";
import Image from "next/image";
import styles from "../InfoDetail.module.scss";

type GalleryItem = {
    image: string;
    title: string;
    description: string;
    alt: string;
};

export default function TempatTinggal() {
    const t = useTranslations("infoDetails.residence");

    const dormitory = t.raw("dormitoryInfo.paragraphs") as string[];

    const gallery = t.raw("gallery.items") as GalleryItem[];

    return (
        <section id="residence">
            <section id="dormitory-info">
                <h3>{t("dormitoryInfo.heading")}</h3>

                {dormitory.map((text, index) => (
                    <p key={index}>{text}</p>
                ))}
            </section>

            <section id="dormitory-gallery">
                <h3>{t("gallery.heading")}</h3>

                <div className={styles.galleryGrid}>
                    {gallery.map((item, index) => (
                        <article key={index} className={styles.galleryCard}>
                            <div className={styles.galleryImageWrap}>
                                <Image
                                    src={item.image}
                                    alt={item.alt}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    className={styles.galleryImage}
                                />
                            </div>

                            <div className={styles.galleryBody}>
                                <h4>{item.title}</h4>

                                <p>{item.description}</p>
                            </div>
                        </article>
                    ))}
                </div>
            </section>
        </section>
    );
}
