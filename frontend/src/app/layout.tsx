import Script from "next/script";
import type { Metadata, Viewport } from "next";
import '@fontsource-variable/rubik';
import '@fontsource/poppins';
import '@/styles/global.scss';
import '@/styles/sonner.scss';
import 'react-loading-skeleton/dist/skeleton.css';
import SessionProvider from "@/providers/SessionProvider";
import { ScrollSpyProvider } from "@/providers/ScrollSpyProvider";
import Header from "@/components/Header/Header";
import BreadcrumbsJsonLd from "@/components/Breadcrumb/Breadcrumbs";
import Footer from "@/components/Footer/Footer";
// import { headers } from "next/headers";

export const metadata: Metadata = {
    title: {
        template: "%s | Universitas Internasional Batam",
        default: "Admisi | Universitas Internasional Batam",
    },
    description: 'Pendaftaran Mahasiswa Baru Universitas Internasional Batam — informasi jadwal, program studi, beasiswa, dan panduan pendaftaran.',
    icons: {
        icon: "/favicon/uib-76.svg",
        apple: "/favicon/uib-180.png",
    },
    manifest: '/manifest.json',
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL as string),
    alternates: {
        canonical: './',
    },
    openGraph: {
        title: {
            template: '%s | Universitas Internasional Batam',
            default: 'Admisi | Universitas Internasional Batam',
        },
        description: 'Pendaftaran Mahasiswa Baru Universitas Internasional Batam — informasi jadwal, program studi, beasiswa, dan panduan pendaftaran.',
        siteName: 'Pendaftaran Universitas Internasional Batam',
        locale: 'id_ID',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: {
            template: '%s | Universitas Internasional Batam',
            default: 'Admisi | Universitas Internasional Batam',
        },
        description: 'Pendaftaran Mahasiswa Baru Universitas Internasional Batam — informasi jadwal, program studi, beasiswa, dan panduan pendaftaran.',
    }
};

export const viewport: Viewport = {
    themeColor: "#002347",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    // const nonce = (await headers()).get('x-nonce') ?? '';

    return (
        <html lang="id">
            <body>
                {process.env.NODE_ENV === 'development' && (
                    <Script
                        src="//unpkg.com/react-scan/dist/auto.global.js"
                        crossOrigin="anonymous"
                        strategy="afterInteractive"
                    />
                )}
                <SessionProvider>
                    <ScrollSpyProvider>
                        <Header />
                        <BreadcrumbsJsonLd />
                        {children}
                        <Footer />
                    </ScrollSpyProvider>
                </SessionProvider>
            </body>
        </html>
    )
}
