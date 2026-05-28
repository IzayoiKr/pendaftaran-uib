import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import {
    getMessages,
    getTranslations,
    setRequestLocale,
} from "next-intl/server";
import { notFound } from "next/navigation";
import Script from "next/script";
import { routing } from "@/i18n/routing";
import QueryProvider from "@/providers/QueryProvider";
import { ScrollSpyProvider } from "@/providers/ScrollSpyProvider";
import SessionProvider from "@/providers/SessionProvider";
import "@/styles/global.scss";
import "@/styles/sonner.scss";
import "@fontsource-variable/rubik";
import "@fontsource/poppins";
import "react-loading-skeleton/dist/skeleton.css";
import BreadcrumbsJsonLd from "@/components/Breadcrumb/Breadcrumbs";
import Footer from "@/components/Footer/Footer";
import Header from "@/components/Header/Header";

// import { headers } from "next/headers";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "metadata" });

    return {
        title: {
            template: "%s | Universitas Internasional Batam",
            default: t("defaultTitle"),
        },
        description: t("description"),
        icons: {
            icon: "/favicon/uib-76.svg",
            apple: "/favicon/uib-180.png",
        },
        manifest: "/manifest.json",
        metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL as string),
        alternates: {
            canonical: "./",
        },
        openGraph: {
            title: t("defaultTitle"),
            description: t("description"),
            siteName: t("siteName"),
            locale: locale === "en" ? "en_US" : "id_ID",
            type: "website",
        },
    };
}

export const viewport: Viewport = {
    themeColor: "#002347",
};

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: "id" | "en" }>;
}) {
    // const nonce = (await headers()).get('x-nonce') ?? '';
    const { locale } = await params;
    if (!hasLocale(routing.locales, locale)) {
        notFound();
    }
    setRequestLocale(locale);
    const messages = await getMessages();

    return (
        <html lang={locale}>
            <body>
                {process.env.NODE_ENV === "development" && (
                    <Script
                        src="//unpkg.com/react-scan/dist/auto.global.js"
                        crossOrigin="anonymous"
                        strategy="afterInteractive"
                    />
                )}
                <NextIntlClientProvider messages={messages} locale={locale}>
                    <SessionProvider>
                        <QueryProvider>
                            <ScrollSpyProvider>
                                <Header />
                                <BreadcrumbsJsonLd />
                                {children}
                                <Footer />
                            </ScrollSpyProvider>
                        </QueryProvider>
                    </SessionProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
