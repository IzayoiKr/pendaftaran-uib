import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Register from "@/views/Register/Register";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "metadata.register" });

    return {
        title: t("title"),
        description: t("description"),
    };
}

export default function RegisterPage() {
    return <Register />;
}
