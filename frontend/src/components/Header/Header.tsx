import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Header.module.scss';
import logo from '../../assets/logo.png';
import { navLinks } from '../../constants/navigation';

interface HamburgerButtonProps {
    isOpen?: boolean;
    setIsOpen: (value: boolean) => void;
}

interface NavMenuProps {
    isOpen?: boolean;
}

function UIBLogo() {
    return (
        <Link to="/" className={styles.logoUIB}>
            <img src={logo} alt="Logo UIB" />
        </Link>
    )
}

function HamburgerButton({ isOpen, setIsOpen }: HamburgerButtonProps) {
    return (
        <button className={`${styles.toggler} ${isOpen ? styles.openState : ''}`}
            onClick={() => setIsOpen(!isOpen)} aria-label='Toggle Menu'>
            <span className={styles.iconBar}></span>
            <span className={styles.iconBar}></span>
            <span className={styles.iconBar}></span>
        </button>
    )
}

function NavMenu({ isOpen }: NavMenuProps) {
    return (
        <div className={`${styles.menuContainer} ${isOpen ? styles.show : ''}`}>
            <nav className={styles.nav}>
                <ul className={styles.menu}>
                    {navLinks.map(link => (
                        <li className={styles.navItem} key={link.to}>
                            <Link className={styles.navLink} to={link.to}>{link.label}</Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    )
}

export default function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [])

    return (
        <header className={`${styles.header} ${isScrolled ? styles.fixed : ''}`} >
            <div className={styles.container}>
                <UIBLogo />
                <HamburgerButton isOpen={isOpen} setIsOpen={setIsOpen} />
                <NavMenu isOpen={isOpen} />
            </div>
        </header >
    )
}

