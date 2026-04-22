'use client';

import { useEffect, useState, useRef, memo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import styles from './Header.module.scss';
import { headerNavLinks, spyIds } from '@/constants/navigation';
import { images } from '@/constants/image';
import useScrollSpy from '@/hooks/useScrollSpy';
import scrollToId from '@/components/ScrollToId';
import useAuthStore from '@/store/useAuthStore';

interface HamburgerButtonProps {
    isOpen?: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

interface NavMenuProps {
    isOpen?: boolean;
    activeId: string;
    pathname: string;
    onLinkClick: () => void;
    isAuthenticated: boolean;
}

function UIBLogo() {
    return (
        <Link href="/" className={styles.logoUIB}>
            <Image
                src={images.logo}
                alt='Universitas Internasional Batam Logo'
                width={197}
                height={47}
                priority
            />
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

function NavMenu({ isOpen, activeId, pathname, onLinkClick, isAuthenticated }: NavMenuProps) {
    return (
        <div className={`${styles.menuContainer} ${isOpen ? styles.show : ''}`}>
            <nav className={styles.nav}>
                <ul className={styles.menu}>
                    {headerNavLinks.map(link => {
                        let displayTo = link.to;
                        let displayLabel = link.label;

                        if (link.to === '/login' && isAuthenticated) {
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
                                    href={displayTo}
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
    const pathname = usePathname();

    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    const headerRef = useRef<HTMLElement>(null);
    const [headerHeight, setHeaderHeight] = useState(80);

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
        <header className={`${styles.header} ${isScrolled ? styles.fixed : ''}`} ref={headerRef}>
            <div className={styles.container}>
                <UIBLogo />
                <HamburgerButton isOpen={isOpen} setIsOpen={setIsOpen} />
                <NavMenu
                    isOpen={isOpen}
                    activeId={activeId}
                    pathname={pathname}
                    onLinkClick={() => setIsOpen(false)}
                    isAuthenticated={isAuthenticated}
                />
            </div>
        </header >
    )
}
