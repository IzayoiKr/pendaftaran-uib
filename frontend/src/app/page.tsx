import Hero from "@/pages/Home/Hero";
import ProgramStudi from "@/pages/Home/ProgramStudi";
import Gelombang from "@/pages/Home/Gelombang";
import Guides from "@/pages/Home/Guides";
import Feature from "@/pages/Home/Feature";
import type { Program, Event } from "@/types";

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

export default async function HomePage() {
    const [programs, events] = await Promise.all([
        fetchProgramStudi(),
        fetchGelombang(),
    ]);

    return (
        <main>
            <Hero />
            <ProgramStudi programs={programs} />
            <Gelombang events={events} />
            <Guides />
            <Feature />
        </main>
    );
}
