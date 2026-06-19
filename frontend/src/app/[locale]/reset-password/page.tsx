import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ResetPassword from "@/views/ResetPassword/ResetPassword";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({
        locale,
        namespace: "metadata.resetPassword",
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

export default function ResetPasswordPage() {
    return (
        <Suspense>
            <ResetPassword />
        </Suspense>
    );
}
