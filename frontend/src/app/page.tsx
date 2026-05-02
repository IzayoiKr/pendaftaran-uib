import dynamic from "next/dynamic";
import Hero from "../pages/Home/Hero";

const ProgramStudi = dynamic(() => import('@/pages/Home/ProgramStudi'));
const Gelombang = dynamic(() => import('@/pages/Home/Gelombang'));
const Guides = dynamic(() => import('@/pages/Home/Guides'));
const Feature = dynamic(() => import('@/pages/Home/Feature'));

export default function HomePage() {
    return (
        <main>
            <Hero />
            <ProgramStudi />
            <Gelombang />
            <Guides />
            <Feature />
        </main>
    );
}
