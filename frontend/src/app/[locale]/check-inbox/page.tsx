import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import CheckInbox from "@/views/CheckInbox/CheckInbox";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({
        locale,
        namespace: "metadata.checkInbox",
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

export default function CheckInboxPage() {
    return (
        <Suspense>
            <CheckInbox />
        </Suspense>
    );
}
