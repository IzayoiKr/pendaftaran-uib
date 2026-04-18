import Script from "next/script";
import type { Metadata } from "next";
import '@fontsource-variable/rubik';
import '@fontsource/poppins';
import '@/styles/global.scss';
import '@/styles/sonner.scss';
import SessionProvider from "@/providers/SessionProvider";
import ScrollToHash from "@/components/ScrollToHash";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";

export const metadata: Metadata = {
    title: 'Admisi | Universitas Internasional Batam',
    description: 'Pendaftaran Mahasiswa Baru Universitas Internasional Batam — informasi jadwal, program studi, beasiswa, dan panduan pendaftaran.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="id">
            <body>
                {process.env.NODE_ENV === 'development' && (
                    <Script
                        src="//unpkg.com/react-scan/dist/auto.global.js"
                        crossOrigin="anonymous"
                        strategy="beforeInteractive"
                    />
                )}
                <SessionProvider>
                    <Header />
                    <ScrollToHash />
                    {children}
                    <Footer />
                </SessionProvider>
            </body>
        </html>
    )
}
