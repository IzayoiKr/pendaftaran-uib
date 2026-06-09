import { useTranslations } from "next-intl";

type ScholarshipItem = {
    id: string;
    heading: string;
    specialRequirementsHeading: string;
    specialRequirements: string[];
    benefitsHeading: string;
    benefits: string[];
};

export default function Beasiswa() {
    const t = useTranslations("infoDetails.scholarship");

    const items = t.raw("items") as ScholarshipItem[];

    return (
        <section id="scholarship">
            {items.map((item) => (
                <section key={item.id} id={`scholarship-${item.id}`}>
                    <h3>{item.heading}</h3>

                    <h4>{item.specialRequirementsHeading}</h4>

                    <ul>
                        {item.specialRequirements.map((requirement, index) => (
                            <li key={index}>{requirement}</li>
                        ))}
                    </ul>

                    <h4>{item.benefitsHeading}</h4>

                    <ul>
                        {item.benefits.map((benefit, index) => (
                            <li key={index}>{benefit}</li>
                        ))}
                    </ul>
                </section>
            ))}
        </section>
    );
}
