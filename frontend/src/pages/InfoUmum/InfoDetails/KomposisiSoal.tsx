import { useTranslations } from "next-intl";
import styles from "../InfoDetail.module.scss";

type TableData = {
    headers: string[];
    rows: string[][];
};

export default function KomposisiSoal() {
    const t = useTranslations("infoDetails.examComposition");
    const paragraphs = t.raw("paragraphs") as string[];
    const table = t.raw("table") as TableData;

    return (
        <section id="exam-composition">
            {paragraphs.map((text, index) => (
                <p key={index}>{text}</p>
            ))}

            <div className={styles.tableWrap}>
                <table>
                    <thead>
                        <tr>
                            {table.headers.map((header, index) => (
                                <th key={index}>{header}</th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {table.rows.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {row.map((cell, cellIndex) => (
                                    <td key={cellIndex}>{cell}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
