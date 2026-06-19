import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Login from "@/views/Login/Login";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: "id" | "en" }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "metadata.login" });

    return {
        title: t("title"),
        description: t("description"),
    };
}

export default function LoginPage() {
    return (
        <Suspense>
            <Login />
        </Suspense>
    );
}
