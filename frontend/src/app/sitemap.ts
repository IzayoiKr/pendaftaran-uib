import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL as string;

export default function sitemap(): MetadataRoute.Sitemap {
    const staticRoutes = [
        { url: BASE_URL, changeFrequency: 'weekly' as const, priority: 0.8 },
        { url: `${BASE_URL}/info-umum`, changeFrequency: 'weekly' as const, priority: 0.8 },
        { url: `${BASE_URL}/login`, changeFrequency: 'monthly' as const, priority: 0.5 },
        { url: `${BASE_URL}/register`, changeFrequency: 'monthly' as const, priority: 0.7 },
        { url: `${BASE_URL}/forgot-password`, changeFrequency: 'monthly' as const, priority: 0.3 },
    ];
    return [...staticRoutes];
}
