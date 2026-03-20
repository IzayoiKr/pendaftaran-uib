import { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Header.module.scss';
import logo from '../../assets/logo.png';
import { navLinks, spyIds } from '../../constants/navigation';
import useScrollSpy from '../../hooks/useScrollSpy';

interface HamburgerButtonProps {
    isOpen?: boolean;
    setIsOpen: (value: boolean) => void;
}

interface NavMenuProps {
    isOpen?: boolean;
    activeId: string;
    onLinkClick: () => void;
}

function UIBLogo() {
    return (
        <Link to="#home" className={styles.logoUIB}>
            <img src={logo} alt="Universitas Internasional Batam Logo" />
        </Link>
    )
}

function HamburgerButton({ isOpen, setIsOpen }: HamburgerButtonProps) {
    return (
        <button className={`${styles.toggler} ${isOpen ? styles.openState : ''}`}
            onClick={() => setIsOpen(prev => !prev)} aria-label='Toggle Menu' aria-expanded={isOpen}>
            <span className={styles.iconBar}></span>
            <span className={styles.iconBar}></span>
            <span className={styles.iconBar}></span>
        </button>
    )
}

function NavMenu({ isOpen, activeId, onLinkClick }: NavMenuProps) {
    return (
        <div className={`${styles.menuContainer} ${isOpen ? styles.show : ''}`}>
            <nav className={styles.nav}>
                <ul className={styles.menu}>
                    {navLinks.map(link => {
                        const isActive = link.hashId ? activeId === link.hashId : false;

                        return (
                            <li className={styles.navItem} key={link.to}>
                                <Link
                                    className={`${styles.navLink} ${isActive ? styles.active : ''}`}
                                    to={link.to}
                                    onClick={onLinkClick}
                                >
                                    {link.label}
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            </nav>
        </div>
    )
}

export default function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const { pathname } = useLocation();

    const headerRef = useRef<HTMLElement>(null);
    const [headerHeight, setHeaderHeight] = useState(80);

    useEffect(() => {
        const updateHeight = () => {
            if (headerRef.current) {
                setHeaderHeight(headerRef.current.offsetHeight);
            }
        }
        updateHeight();
        window.addEventListener('resize', updateHeight);
        return () => window.removeEventListener('resize', updateHeight);
    }, [])

    const activeId = useScrollSpy({ ids: spyIds, offset: headerHeight });

    useEffect(() => {
        setIsOpen(false);
    }, [pathname])

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [])

    return (
        <header className={`${styles.header} ${isScrolled ? styles.fixed : ''}`} ref={headerRef}>
            <div className={styles.container}>
                <UIBLogo />
                <HamburgerButton isOpen={isOpen} setIsOpen={setIsOpen} />
                <NavMenu
                    isOpen={isOpen}
                    activeId={activeId}
                    onLinkClick={() => setIsOpen(false)}
                />
            </div>
        </header >
    )
}

