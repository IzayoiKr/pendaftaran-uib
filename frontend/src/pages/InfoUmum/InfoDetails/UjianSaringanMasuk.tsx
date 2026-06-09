import { useTranslations } from "next-intl";

type ExamStage = {
    title: string;
    description: string;
};

type ConditionItem = {
    text: string;
    description?: string;
};

export default function UjianSaringanMasuk() {
    const t = useTranslations("infoDetails.entranceExam");

    const paragraphs = t.raw("paragraphs") as string[];

    const examStages = t.raw("examStages.items") as ExamStage[];

    const offline = t.raw("offlineConditions.items") as ConditionItem[];

    const online = t.raw("onlineConditions.items") as ConditionItem[];

    return (
        <section id="entrance-exam">
            <h2>{t("heading")}</h2>

            {paragraphs.map((text, index) => (
                <p key={index}>{text}</p>
            ))}

            <section id="exam-stages">
                <h3>{t("examStages.heading")}</h3>

                <p>{t("examStages.description")}</p>

                <ol>
                    {examStages.map((item, index) => (
                        <li key={index}>
                            {item.title}

                            <p>{item.description}</p>
                        </li>
                    ))}
                </ol>
            </section>

            <section id="offline-conditions">
                <h3>{t("offlineConditions.heading")}</h3>

                <ol>
                    {offline.map((item, index) => (
                        <li key={index}>
                            {item.text}

                            {item.description && <p>{item.description}</p>}
                        </li>
                    ))}
                </ol>
            </section>

            <section id="online-conditions">
                <h3>{t("onlineConditions.heading")}</h3>

                <ol>
                    {online.map((item, index) => (
                        <li key={index}>
                            {item.text}

                            {item.description && <p>{item.description}</p>}
                        </li>
                    ))}
                </ol>
            </section>
        </section>
    );
}
