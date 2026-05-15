'use client';

import { usePathname } from "next/navigation";
import { BREADCRUMB_LABELS } from "@/constants/breadcrumbs";

export default function BreadcrumbsJsonLd() {
    const pathname = usePathname() ?? "";
    const segments = pathname?.split('/').filter(Boolean);

    const items = [
        { name: 'Beranda', url: '/' },
        ...segments.map((seg, idx) => {
            const url = '/' + segments.slice(0, idx + 1).join('/');
            const name = BREADCRUMB_LABELS[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1);
            return { name, url };
        }),
    ];

    if (items.length <= 1) return null;

    const ldJson = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            item: {
                '@id': `${process.env.NEXT_PUBLIC_BASE_URL}${item.url}`,
                name: item.name,
            },
        })),
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
            />
        </>
    )
}
