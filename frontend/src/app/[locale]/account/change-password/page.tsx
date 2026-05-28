import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ChangePassword from "@/pages/ChangePassword/ChangePassword";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({
        locale,
        namespace: "metadata.account.changePassword",
    });

    return {
        title: t("title"),
        description: t("description"),
    };
}

export default function ChangePasswordPage() {
    return <ChangePassword />;
}
