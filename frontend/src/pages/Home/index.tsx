import Header from '../../components/Header/Header';
import Hero from './components/Hero/Hero';
import ProgramStudi from './components/ProgramStudi/ProgramStudi';
import Gelombang from './components/Gelombang/Gelombang';
import Panduan from "./components/Panduan/Panduan";
import Feature from './components/Feature/Feature';
import Footer from "../../components/Footer/Footer";

export default function Home() {
    return (
        <>
            <Header />
            <main>
                <Hero />
                <ProgramStudi />
                <Gelombang />
                <Panduan />
                <Feature />
            </main>
            <Footer />
        </>
    )
}

