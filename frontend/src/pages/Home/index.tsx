import Header from '../../components/Header/Header';
import Hero from './components/Hero/Hero';
import ProgramStudi from './components/ProgramStudi/ProgramStudi';
import Gelombang from './components/Gelombang/Gelombang';
import Panduan from "./components/Panduan/Panduan";
import Fitur from "./components/Fitur/Fitur";
import Footer from "../../components/Footer/Footer";
import styles from "./index.module.scss";

export default function Home() {
    return (
        <>
            <Header className={styles.topSection} />
            <main>
                <Hero className={styles.topSection} />
                <ProgramStudi />
                <Gelombang />
                <Panduan />
                <Fitur />
            </main>
            <Footer />
        </>
    );
}

