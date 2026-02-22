import type { FC } from 'react';
import Header from '../../components/Header/Header';
import Hero from './components/Hero/Hero';
import ProgramStudi from './components/ProgramStudi/ProgramStudi';
import Gelombang from './components/Gelombang/Gelombang';
import Panduan from "./components/Panduan/Panduan";
import Fitur from "./components/Fitur/Fitur";
import Footer from "../../components/Footer/Footer";

const Home: FC = () => {
    return (
        <>
            <Header />
            <main>
                <Hero />
                <ProgramStudi />
                <Gelombang />
                <Panduan />
                <Fitur />
            </main>
            <Footer />
        </>
    );
}

export default Home;

