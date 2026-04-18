import Hero from "@/pages/Home/Hero/Hero";
import ProgramStudi from "@/pages/Home/ProgramStudi/ProgramStudi";
import Gelombang from "@/pages/Home/Gelombang/Gelombang";
import Feature from "@/pages/Home/Feature/Feature";
import Guides from "@/pages/Home/Guides/Guides";

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
