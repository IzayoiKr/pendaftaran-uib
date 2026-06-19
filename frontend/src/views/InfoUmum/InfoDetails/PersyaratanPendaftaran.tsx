import { useTranslations } from "next-intl";
import styles from "../InfoDetail.module.scss";

type RegistrationItem = {
    text: string;
    subItems?: string[];
    callout?: string;
    emailInfo?: {
        label: string;
        emails: string[];
    };
    includeLabel?: string;
    includeItems?: string[];
};

type RegistrationSection = {
    id: string;
    heading: string;
    description?: string;
    paragraphs?: string[];
    items?: RegistrationItem[];
    callout?: {
        heading: string;
        description: string;
    };
};

export default function PersyaratanPendaftaran() {
    const t = useTranslations("infoDetails.registrationRequirements");
    const sections = t.raw("sections") as RegistrationSection[];

    return (
        <section id="registration-requirements">
            {sections.map((section) => (
                <section key={section.id} id={section.id}>
                    <h3>{section.heading}</h3>

                    {section.description && <p>{section.description}</p>}

                    {section.paragraphs?.map((text, index) => (
                        <p key={index}>{text}</p>
                    ))}

                    {section.items && (
                        <ol>
                            {section.items.map((item, index) => (
                                <li key={index}>
                                    {item.text}

                                    {item.subItems && (
                                        <ul>
                                            {item.subItems.map(
                                                (subItem, subIndex) => (
                                                    <li key={subIndex}>
                                                        {subItem}
                                                    </li>
                                                ),
                                            )}
                                        </ul>
                                    )}

                                    {item.callout && <p>{item.callout}</p>}

                                    {item.emailInfo && (
                                        <>
                                            <p>{item.emailInfo.label}</p>

                                            <ul>
                                                {item.emailInfo.emails.map(
                                                    (email, emailIndex) => (
                                                        <li key={emailIndex}>
                                                            <a
                                                                href={`mailto:${email}`}
                                                            >
                                                                {email}
                                                            </a>
                                                        </li>
                                                    ),
                                                )}
                                            </ul>
                                        </>
                                    )}

                                    {item.includeLabel && (
                                        <>
                                            <p>{item.includeLabel}</p>

                                            <ul>
                                                {item.includeItems?.map(
                                                    (include, includeIndex) => (
                                                        <li key={includeIndex}>
                                                            {include}
                                                        </li>
                                                    ),
                                                )}
                                            </ul>
                                        </>
                                    )}
                                </li>
                            ))}
                        </ol>
                    )}

                    {section.callout && (
                        <div className={styles.callout}>
                            <strong>{section.callout.heading}:</strong>

                            <p>{section.callout.description}</p>
                        </div>
                    )}
                </section>
            ))}
        </section>
    );
}
