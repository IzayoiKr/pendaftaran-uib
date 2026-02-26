import type { FC } from 'react';
import { Link } from 'react-router-dom';
import styles from './Header.module.scss';
import logo from '../../assets/logo.png'

const Header: FC = () => {
    return (
        <header className={styles.header}>
            <div className="container">
                <nav className={styles.nav}>
                    <Link to="/" className={styles.logo}>
                    <img src={logo} alt="UIB"/>
                    </Link>
                    <ul className={styles.menu}>
                        <li><Link to="/#home">Beranda</Link></li>
                        <li><Link to="/#gelombang">Gelombang</Link></li>
                        <li><Link to="/#info-umum">Informasi Umum</Link></li>
                        <li><Link to="/#kontak">Kontak</Link></li>
                        <li><Link to="/#panduan">Panduan</Link></li>
                        <li><Link to="/#login">Daftar/Login</Link></li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}

export default Header;

