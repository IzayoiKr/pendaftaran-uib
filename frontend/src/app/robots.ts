import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: ['/', '/login', '/register', '/info-umum', '/panduan'],
            disallow: ['/api/'],
        },
        sitemap: `${process.env.NEXT_PUBLIC_BASE_URL}/sitemap.xml`,
    }
}
