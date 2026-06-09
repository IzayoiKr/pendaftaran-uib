import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL as string;

export default function sitemap(): MetadataRoute.Sitemap {
    const locales = ["id", "en"];

    const routesConfig = [
        { path: "", changeFrequency: "weekly" as const, priority: 0.8 },
        {
            path: "/info-umum",
            changeFrequency: "weekly" as const,
            priority: 0.8,
        },
        { path: "/login", changeFrequency: "monthly" as const, priority: 0.5 },
        {
            path: "/register",
            changeFrequency: "monthly" as const,
            priority: 0.7,
        },
        {
            path: "/forgot-password",
            changeFrequency: "monthly" as const,
            priority: 0.3,
        },
    ];

    const localizedRoutes = locales.flatMap((locale) =>
        routesConfig.map((route) => ({
            url: `${BASE_URL}/${locale}${route.path}`,
            changeFrequency: route.changeFrequency,
            priority: route.priority,
        })),
    );

    return localizedRoutes;
}
