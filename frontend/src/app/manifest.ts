import type { MetadataRoute } from "next";
import { cookies, headers } from "next/headers";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
    const cookieStore = await cookies();
    const headerList = await headers();

    const locale =
        cookieStore.get("NEXT_LOCALE")?.value ||
        headerList.get("accept-language")?.split(",")[0] ||
        "id";
    const isEn = locale.startsWith("en");

    return {
        name: isEn
            ? "UIB New Student Registration"
            : "Pendaftaran Mahasiswa Baru UIB",
        short_name: isEn ? "Registration" : "Pendaftaran",
        description: isEn
            ? "New Student Registration for Universitas Internasional Batam"
            : "Pendaftaran Mahasiswa Baru Universitas Internasional Batam",
        start_url: isEn ? "/en" : "/id",
        scope: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#002347",
        theme_color: "#002347",
        icons: [
            {
                src: "/favicon/uib-192.png",
                sizes: "192x192",
                type: "image/png",
                purpose: "any",
            },
            {
                src: "/favicon/uib-192.png",
                sizes: "192x192",
                type: "image/png",
                purpose: "maskable",
            },
            {
                src: "/favicon/uib-512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "any",
            },
            {
                src: "/favicon/uib-512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "maskable",
            },
            {
                src: "/favicon/uib-180.png",
                sizes: "180x180",
                type: "image/png",
            },
        ],
    };
}
