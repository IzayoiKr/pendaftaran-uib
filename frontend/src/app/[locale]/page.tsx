import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Gelombang from "@/pages/Home/Gelombang/Gelombang";
import GelombangSkeleton from "@/pages/Home/Gelombang/Gelombang.skeleton";
import Guides from "@/pages/Home/Guides/Guides";
import Hero from "@/pages/Home/Hero/Hero";
import ProgramStudi from "@/pages/Home/ProgramStudi/ProgramStudi";
import ProgramStudiSkeleton from "@/pages/Home/ProgramStudi/ProgramStudi.skeleton";
import type { Event, Program } from "@/types/api";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: "id" | "en" }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "metadata.home" });

    return {
        title: t("title"),
    };
}

export const revalidate = 3600;

async function fetchProgramStudi(): Promise<Program[]> {
    try {
        const res = await fetch(`${process.env.BACKEND_URL}/api/program_studi`);
        if (!res.ok) return [];
        return res.json();
    } catch {
        return [];
    }
}

async function fetchGelombang(): Promise<Event[]> {
    try {
        const res = await fetch(`${process.env.BACKEND_URL}/api/gelombang`);
        if (!res.ok) return [];
        return res.json();
    } catch {
        return [];
    }
}

async function ProgramStudiSection() {
    const programs = await fetchProgramStudi();
    return <ProgramStudi programs={programs} />;
}

async function GelombangSection() {
    const event = await fetchGelombang();
    return <Gelombang events={event} />;
}

export default async function HomePage({
    params,
}: {
    params: Promise<{ locale: "id" | "en" }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);
    return (
        <main>
            <Hero />
            <Suspense fallback={<ProgramStudiSkeleton />}>
                <ProgramStudiSection />
            </Suspense>
            <Suspense fallback={<GelombangSkeleton />}>
                <GelombangSection />
            </Suspense>
            <Guides />
        </main>
    );
}
