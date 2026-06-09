import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Prodi from "@/pages/Prodi/Prodi";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({
        locale,
        namespace: "metadata.account.prodi",
    });

    return {
        title: t("title"),
        description: t("description"),
    };
}

export default async function ProdiPage({
    params,
}: {
    params: Promise<{ locale: string; regID: string }>;
}) {
    const { regID } = await params;
    return <Prodi regID={regID} />;
}
