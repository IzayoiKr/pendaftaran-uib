import type { Metadata } from 'next';
import Hero from '@/pages/Home/Hero/Hero';
import ProgramStudi from '@/pages/Home/ProgramStudi/ProgramStudi';
import ProgramStudiSkeleton from '@/pages/Home/ProgramStudi/ProgramStudi.skeleton';
import Gelombang from '@/pages/Home/Gelombang/Gelombang';
import GelombangSkeleton from '@/pages/Home/Gelombang/Gelombang.skeleton';
import Guides from '@/pages/Home/Guides/Guides';
import type { Program, Event } from "@/types/api";
import { Suspense } from 'react';

export const metadata: Metadata = {
    title: "Beranda",
};

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

export default async function HomePage() {
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
