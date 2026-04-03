import { lazy } from 'react';
import Header from '../../components/Header/Header';
import Hero from './Hero/Hero';
const ProgramStudi = lazy(() => import('./ProgramStudi/ProgramStudi'));
const Gelombang = lazy(() => import('./Gelombang/Gelombang'));
const Guides = lazy(() => import('./Guides/Guides'));
import Feature from './Feature/Feature';
import Footer from '../../components/Footer/Footer';

export default function Home() {
    return (
        <>
            <Header />
            <main>
                <Hero />
                <ProgramStudi />
                <Gelombang />
                <Guides />
                <Feature />
            </main>
            <Footer />
        </>
    )
}

