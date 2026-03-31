import Header from '../../components/Header/Header';
import Hero from './Hero/Hero';
import ProgramStudi from './ProgramStudi/ProgramStudi';
import Gelombang from './Gelombang/Gelombang';
import Guide from './Guides/Guides';
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
                <Guide />
                <Feature />
            </main>
            <Footer />
        </>
    )
}

