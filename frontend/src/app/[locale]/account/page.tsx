import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Account from "@/pages/Account/Account";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({
        locale,
        namespace: "metadata.account",
    });

    return {
        title: t("title"),
        description: t("description"),
    };
}

export default function AccountPage() {
    return <Account />;
}
