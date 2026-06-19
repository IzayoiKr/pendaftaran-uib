import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import VerifyEmail from "@/views/VerifyEmail/VerifyEmail";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({
        locale,
        namespace: "metadata.verifyEmail",
    });

    return {
        title: t("title"),
        description: t("description"),
        robots: {
            index: false,
            follow: false,
        },
    };
}

export default function VerifyEmailPage() {
    return (
        <Suspense>
            <VerifyEmail />
        </Suspense>
    );
}
