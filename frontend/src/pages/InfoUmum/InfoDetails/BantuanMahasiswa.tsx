import { useTranslations } from "next-intl";
import styles from "../InfoDetail.module.scss";

type ContactData = {
    heading: string;
    description: string;
};

export default function StudentAssistance() {
    const t = useTranslations("infoDetails.studentAssistance");

    const paragraphs = t.raw("paragraphs") as string[];

    const contact = t.raw("contact") as ContactData;

    return (
        <section id="student-assistance">
            {paragraphs.map((text, index) => (
                <p key={index}>{text}</p>
            ))}

            <div className={styles.callout}>
                <strong>{contact.heading}:</strong>

                <p>
                    {contact.description}{" "}
                    <a href="mailto:humas@uib.ac.id">humas@uib.ac.id</a>
                </p>
            </div>
        </section>
    );
}
