import { useTranslations } from "next-intl";
import styles from "../InfoDetail.module.scss";

type TableData = {
    headers: string[];
    rows: string[][];
};

type SectionData = {
    id: string;
    heading: string;
    paragraphs?: string[];
    items?: string[];
    table?: TableData;
    callout?: {
        heading: string;
        items: string[];
    };
};

export default function BiayaKuliah() {
    const t = useTranslations("infoDetails.tuitionFee");
    const sections = t.raw("sections") as SectionData[];

    return (
        <section id="tuition-fee">
            {sections.map((section) => (
                <section key={section.id} id={section.id}>
                    <h3>{section.heading}</h3>

                    {section.paragraphs?.map((text, index) => (
                        <p key={index}>{text}</p>
                    ))}

                    {section.items && (
                        <ol>
                            {section.items.map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ol>
                    )}

                    {section.table && (
                        <div className={styles.tableWrap}>
                            <table>
                                <thead>
                                    <tr>
                                        {section.table.headers.map(
                                            (header, index) => (
                                                <th key={index}>{header}</th>
                                            ),
                                        )}
                                    </tr>
                                </thead>

                                <tbody>
                                    {section.table.rows.map((row, rowIndex) => (
                                        <tr key={rowIndex}>
                                            {row.map((cell, cellIndex) => (
                                                <td key={cellIndex}>{cell}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {section.callout && (
                        <div className={styles.callout}>
                            <strong>{section.callout.heading}:</strong>

                            <ol>
                                {section.callout.items.map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ol>
                        </div>
                    )}
                </section>
            ))}
        </section>
    );
}
