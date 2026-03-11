import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Header.module.scss';
import logo from '../../assets/logo.png';
import { navLinks } from '../../constants/navigation';

interface HeaderProps {
    className?: string;
}

interface HamburgerButtonProps {
    isOpen?: boolean;
    setIsOpen?: (value: boolean) => void;
}

interface NavMenuProps {
    isOpen?: boolean;
}

function UIBLogo() {
    return (
        <Link to="/">
            <img src={logo} alt="Logo UIB" />
        </Link>
    )
}

function HamburgerButton({ isOpen, setIsOpen }: HamburgerButtonProps) {
    return (
        <button className={styles.toggler} onClick={() => setIsOpen(!isOpen)} aria-label='Toggle Menu'>
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
                        <li key={link.to}>
                            <Link to={link.to}>{link.label}</Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    )
}

export default function Header({ className }: HeaderProps) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <header className={`${styles.header} ${className}`} >
            <div className={styles.container}>
                <UIBLogo />
                <HamburgerButton isOpen={isOpen} setIsOpen={setIsOpen} />
                <NavMenu isOpen={isOpen} />
            </div>
        </header >
    )
}

