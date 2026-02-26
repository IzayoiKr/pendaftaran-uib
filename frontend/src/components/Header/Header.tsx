import { Link } from 'react-router-dom';
import styles from './Header.module.scss';
import logo from '../../assets/logo.png';
import { navLinks } from '../../constants/navigation';

export default function Header() {
    return (
        <header className={styles.header}>
            <div className="container">
                <nav className={styles.nav}>
                    <Link to="/" className={styles.logo}>
                        <img src={logo} alt="UIB" />
                    </Link>
                    <ul className={styles.menu}>
                        {navLinks.map(link => (
                            <li key={link.to}>
                                <Link to={link.to}>{link.label}</Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </header>
    );
}

