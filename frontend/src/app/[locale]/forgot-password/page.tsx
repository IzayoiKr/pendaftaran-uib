import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ForgotPassword from "@/views/ForgotPassword/ForgotPassword";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({
        locale,
        namespace: "metadata.forgotPassword",
    });

    return {
        title: t("title"),
        description: t("description"),
    };
}

export default function ForgotPasswordPage() {
    return <ForgotPassword />;
}
