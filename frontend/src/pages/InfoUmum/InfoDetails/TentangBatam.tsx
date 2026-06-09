import { useTranslations } from "next-intl";
import Image from "next/image";
import styles from "../InfoDetail.module.scss";

export default function AboutBatam() {
    const t = useTranslations("infoDetails.aboutBatam");

    const paragraphs = t.raw("paragraphs");
    const culture = t.raw("sections.cultureLanguage.paragraphs");
    const religion = t.raw("sections.religion.paragraphs");
    const facilities = t.raw("sections.publicFacilities");

    return (
        <section id="about-batam">
            <h2>{t("heading")}</h2>

            {paragraphs.map((text: string, index: number) => (
                <p key={index}>{text}</p>
            ))}

            <section id="culture-language">
                <h3>{t("sections.cultureLanguage.heading")}</h3>

                {culture.map((text: string, index: number) => (
                    <p key={index}>{text}</p>
                ))}
            </section>

            <section id="religion">
                <h3>{t("sections.religion.heading")}</h3>

                {religion.map((text: string, index: number) => (
                    <p key={index}>{text}</p>
                ))}
            </section>

            <section id="public-facilities">
                <h3>{t("sections.publicFacilities.heading")}</h3>

                <p>{facilities.description}</p>

                <div className={styles.imageWrapper}>
                    <Image
                        src="/images/infoumum/fb.jpg"
                        alt={facilities.alt}
                        width={1200}
                        height={800}
                        className={styles.image}
                    />
                </div>

                <p className={styles.source}>
                    Source:{" "}
                    <a
                        href={facilities.source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {facilities.source.label}
                    </a>
                </p>
            </section>
        </section>
    );
}
