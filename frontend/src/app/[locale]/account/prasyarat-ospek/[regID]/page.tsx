import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import PrasyaratOspek from "@/pages/PrasyaratOspek/PrasyaratOspek";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({
        locale,
        namespace: "metadata.account.prasyaratOspek",
    });

    return {
        title: t("title"),
        description: t("description"),
    };
}

export default async function PrasyaratOspekPage({
    params,
}: {
    params: Promise<{ locale: string; regID: string }>;
}) {
    const { regID } = await params;
    return <PrasyaratOspek regID={regID} />;
}
