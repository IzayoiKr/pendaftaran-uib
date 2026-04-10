import { useEffect, useState, useRef, memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Header.module.scss';
import { headerNavLinks, spyIds } from '../../constants/navigation';
import { getImg } from '../../constants/data';
import useScrollSpy from '../../hooks/useScrollSpy';
import scrollToId from '../ScrollToId';
import { getStoredUser } from '../../api'; // <-- Import your session helper

interface HamburgerButtonProps {
    isOpen?: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

interface NavMenuProps {
    isOpen?: boolean;
    activeId: string;
    pathname: string;
    onLinkClick: () => void;
    isLoggedIn: boolean; // <-- Add prop to know if user is logged in
}

function UIBLogo() {
    return (
        <Link to="/#home" className={styles.logoUIB}>
            <picture>
                <source srcSet={getImg('logo.avif')} type='image/avif' />
                <source srcSet={getImg('logo.webp')} type='image/webp' />
                <img
                    src={getImg('logo.png')}
                    alt='Universitas Internasional Batam Logo'
                    width='197'
                    height='47'
                    fetchPriority='high'
                />
            </picture>
        </Link>
    )
}

const HamburgerButton = memo(function HamburgerButton({ isOpen, setIsOpen }: HamburgerButtonProps) {
    return (
        <button className={`${styles.toggler} ${isOpen ? styles.openState : ''}`}
            onClick={() => setIsOpen(prev => !prev)} aria-label='Toggle Menu' aria-expanded={isOpen}>
            <span className={styles.iconBar}></span>
            <span className={styles.iconBar}></span>
            <span className={styles.iconBar}></span>
        </button>
    )
})

function NavMenu({ isOpen, activeId, pathname, onLinkClick, isLoggedIn }: NavMenuProps) {
    return (
        <div className={`${styles.menuContainer} ${isOpen ? styles.show : ''}`}>
            <nav className={styles.nav}>
                <ul className={styles.menu}>
                    {headerNavLinks.map(link => {
                        // Default to the original link data
                        let displayTo = link.to;
                        let displayLabel = link.label;

                        // If this is the login link AND the user is logged in, change it
                        if (link.to === '/login' && isLoggedIn) {
                            displayTo = '/account';
                            displayLabel = 'Akun Saya';
                        }

                        const isActive = link.hashId ? activeId === link.hashId : pathname === displayTo;

                        const handleClick = (e: React.MouseEvent) => {
                            onLinkClick();
                            if (link.hashId && window.location.pathname === '/') {
                                e.preventDefault();
                                scrollToId(link.hashId);
                            }
                        }

                        return (
                            <li className={styles.navItem} key={link.to}>
                                <Link
                                    className={`${styles.navLink} ${isActive ? styles.active : ''}`}
                                    to={displayTo}
                                    onClick={handleClick}
                                >
                                    {displayLabel}
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
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isScrolled, setIsScrolled] = useState<boolean>(false);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false); // <-- Track auth state
    const { pathname } = useLocation();

    const headerRef = useRef<HTMLElement>(null);
    const [headerHeight, setHeaderHeight] = useState(80);

    // Check login status on mount and whenever the URL path changes
    useEffect(() => {
        setIsLoggedIn(!!getStoredUser());
    }, [pathname]);

    useEffect(() => {
        const update = () => {
            if (headerRef.current) setHeaderHeight(headerRef.current.offsetHeight);
        }
        update();
        window.addEventListener('resize', update, { passive: true });
        return () => window.removeEventListener('resize', update);
    }, [])

    useEffect(() => { setIsOpen(false) }, [pathname]);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [])

    const activeId = useScrollSpy({ ids: spyIds, offset: headerHeight });

    return (
        <header className={isScrolled ? styles.fixed : ''} ref={headerRef}>
            <div className={styles.container}>
                <UIBLogo />
                <HamburgerButton isOpen={isOpen} setIsOpen={setIsOpen} />
                <NavMenu
                    isOpen={isOpen}
                    activeId={activeId}
                    pathname={pathname}
                    onLinkClick={() => setIsOpen(false)}
                    isLoggedIn={isLoggedIn} // <-- Pass state down to NavMenu
                />
            </div>
        </header >
    )
}
