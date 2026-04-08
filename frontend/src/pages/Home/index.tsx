import { lazy, Suspense } from 'react';
import Header from '../../components/Header/Header';
import Hero from './Hero/Hero';
const ProgramStudi = lazy(() => import('./ProgramStudi/ProgramStudi'));
const Gelombang = lazy(() => import('./Gelombang/Gelombang'));
const Guides = lazy(() => import('./Guides/Guides'));
const Feature = lazy(() => import('./Feature/Feature'))
import Footer from '../../components/Footer/Footer';

export default function Home() {
    return (
        <>
            <Header />
            <main>
                <Hero />
                <Suspense fallback={<div>Loading Program Studi...</div>}>
                    <ProgramStudi />
                </Suspense>
                <Suspense fallback={<div>Loading Gelombang...</div>}>
                    <Gelombang />
                </Suspense>
                <Suspense fallback={<div>Loading Guides...</div>}>
                    <Guides />
                </Suspense>
                <Suspense fallback={<div>Loading Awesome Features...</div>}>
                    <Feature />
                </Suspense>
            </main>
            <Footer />
        </>
    )
}
