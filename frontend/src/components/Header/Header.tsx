"use client";

import { memo, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import useScrollSpy from "@/hooks/useScrollSpy";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useScrollSpyContext } from "@/providers/ScrollSpyProvider";
import scrollToId from "@/utils/ScrollToId";
import useAuthStore from "@/store/useAuthStore";
import { headerNavLinks, spyIds } from "./data";
import styles from "./Header.module.scss";

interface HamburgerButtonProps {
    isOpen?: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

interface NavMenuProps {
    isOpen?: boolean;
    activeId: string;
    pathname: string;
    onLinkClick: (e: React.MouseEvent, to: string, hashId?: string) => void;
    isAuthenticated: boolean;
}

function UIBLogo() {
    return (
        <Link href="/" className={styles.logoUIB}>
            <Image
                src="/images/logo.png"
                alt="Universitas Internasional Batam Logo"
                width={197}
                height={47}
                priority
            />
        </Link>
    );
}

const HamburgerButton = memo(function HamburgerButton({
    isOpen,
    setIsOpen,
}: HamburgerButtonProps) {
    return (
        <button
            className={`${styles.toggler} ${isOpen ? styles.openState : ""}`}
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label="Toggle Menu"
            aria-expanded={isOpen}
        >
            <span className={styles.iconBar}></span>
            <span className={styles.iconBar}></span>
            <span className={styles.iconBar}></span>
        </button>
    );
});

function NavMenu({
    isOpen,
    activeId,
    pathname,
    onLinkClick,
    isAuthenticated,
}: NavMenuProps) {
    const t = useTranslations("header");

    return (
        <div className={`${styles.menuContainer} ${isOpen ? styles.show : ""}`}>
            <nav className={styles.nav}>
                <ul className={styles.menu}>
                    {headerNavLinks.map((link) => {
                        const isLoginLink =
                            link.to === "/login" && isAuthenticated;
                        const displayTo = isLoginLink ? "/account" : link.to;
                        const displayLabel = isLoginLink
                            ? t("myAccount")
                            : t(link.labelKey);

                        const isActive = link.hashId
                            ? activeId === link.hashId
                            : pathname === displayTo;

                        return (
                            <li className={styles.navItem} key={link.to}>
                                <Link
                                    className={`${styles.navLink} ${isActive ? styles.active : ""}`}
                                    href={displayTo}
                                    onClick={(e) =>
                                        onLinkClick(e, displayTo, link.hashId)
                                    }
                                >
                                    {displayLabel}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </div>
    );
}

export default function Header() {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isScrolled, setIsScrolled] = useState<boolean>(false);
    const { ready } = useScrollSpyContext();
    const router = useRouter();
    const pathname = usePathname() ?? "";

    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    const headerRef = useRef<HTMLElement>(null);
    const [headerHeight, setHeaderHeight] = useState(80);

    useEffect(() => {
        const el = headerRef.current;
        if (!el) return;

        const update = () => setHeaderHeight(el.offsetHeight);
        update();

        const ro = new ResizeObserver(update);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsOpen(false);
    }, [pathname]);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const activeId = useScrollSpy({ ids: spyIds, offset: headerHeight, ready });

    const handleLinkClick = (
        e: React.MouseEvent,
        to: string,
        hashId?: string,
    ) => {
        e.preventDefault();
        setIsOpen(false);

        if (pathname === "/" && hashId) {
            scrollToId(hashId);
        } else {
            router.push(to);
            if (hashId) {
                setTimeout(() => scrollToId(hashId), 150);
            }
        }
    };

    return (
        <header
            className={`${styles.header} ${isScrolled ? styles.fixed : ""}`}
            ref={headerRef}
        >
            <div className={styles.container}>
                <UIBLogo />
                <HamburgerButton isOpen={isOpen} setIsOpen={setIsOpen} />
                <NavMenu
                    isOpen={isOpen}
                    activeId={activeId}
                    pathname={pathname}
                    onLinkClick={handleLinkClick}
                    isAuthenticated={isAuthenticated}
                />
            </div>
        </header>
    );
}
