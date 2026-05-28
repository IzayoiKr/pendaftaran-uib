import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import TransferProof from "@/pages/TransferProof/TransferProof";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({
        locale,
        namespace: "metadata.account.transferProof",
    });

    return {
        title: t("title"),
        description: t("description"),
    };
}

export default function TransferProofPage() {
    return <TransferProof />;
}
