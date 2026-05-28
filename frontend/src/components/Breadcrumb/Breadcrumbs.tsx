"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

const SEGMENT_TO_KEY: Record<string, string> = {
    "info-umum": "infoUmum",
    "forgot-password": "forgotPassword",
    "reset-password": "resetPassword",
    "verify-email": "verifyEmail",
    "check-inbox": "checkInbox",
    "update-profile": "updateProfile",
    "change-password": "changePassword",
    "prasyarat-ospek": "prasyaratOspek",
    "change-prodi": "changeProdi",
    "transfer-proof": "transferProof",
    "upload-transfer-proof": "uploadTransferProof",
};

function formatSegment(seg: string): string {
    return seg
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
}

export default function BreadcrumbsJsonLd() {
    const pathname = usePathname();
    const t = useTranslations("breadcrumbs");

    const segments = pathname?.split("/").filter(Boolean) ?? [];

    const items = [
        { name: t("home"), url: "/" },
        ...segments.map((seg, idx) => {
            const url = "/" + segments.slice(0, idx + 1).join("/");
            const key = SEGMENT_TO_KEY[seg];
            const name = key ? t(key) : formatSegment(seg);
            return { name, url };
        }),
    ];

    if (items.length <= 1) return null;

    const ldJson = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: {
                "@id": `${process.env.NEXT_PUBLIC_BASE_URL}${item.url}`,
                name: item.name,
            },
        })),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
        />
    );
}
