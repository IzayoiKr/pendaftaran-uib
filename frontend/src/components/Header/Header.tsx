"use client";

import { memo, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import useScrollSpy from "@/hooks/useScrollSpy";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useScrollSpyContext } from "@/providers/ScrollSpyProvider";
import scrollToId from "@/utils/ScrollToId";
import clsx from "clsx";
import useAuthStore from "@/store/useAuthStore";
import LanguageSwitcher from "@/components/LanguageSwitcher/LanguageSwitcher";
import { headerNavLinks, spyIds } from "./data";
import styles from "./Header.module.scss";

interface HamburgerButtonProps {
    isOpen: boolean;
    onToggle: () => void;
}

interface NavMenuProps {
    isOpen: boolean;
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
    onToggle,
}: HamburgerButtonProps) {
    return (
        <button
            className={clsx(styles.toggler, isOpen && styles.openState)}
            onClick={onToggle}
            aria-label="Toggle Menu"
            aria-expanded={isOpen}
        >
            <span className={styles.iconBar} />
            <span className={styles.iconBar} />
            <span className={styles.iconBar} />
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
        <div className={clsx(styles.menuContainer, isOpen && styles.show)}>
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
                                    className={clsx(
                                        styles.navLink,
                                        isActive && styles.active,
                                    )}
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
    const [openAtPathname, setOpenAtPathname] = useState<string | null>(null);

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

    const isOpen = openAtPathname === pathname;

    const activeId = useScrollSpy({
        ids: spyIds,
        offset: headerHeight,
        ready,
    });

    const handleLinkClick = (
        e: React.MouseEvent,
        to: string,
        hashId?: string,
    ) => {
        e.preventDefault();

        setOpenAtPathname(null);

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
            className={styles.header}
            ref={headerRef}
            style={{ "--header-h": `${headerHeight}px` } as React.CSSProperties}
        >
            <div className={styles.container}>
                <div className={styles.left}>
                    <UIBLogo />
                </div>

                <div className={styles.center}>
                    <NavMenu
                        isOpen={false}
                        activeId={activeId}
                        pathname={pathname}
                        onLinkClick={handleLinkClick}
                        isAuthenticated={isAuthenticated}
                    />
                </div>

                <div className={styles.right}>
                    <LanguageSwitcher />

                    <HamburgerButton
                        isOpen={isOpen}
                        onToggle={() =>
                            setOpenAtPathname(isOpen ? null : pathname)
                        }
                    />
                </div>
            </div>

            <div className={styles.mobileMenuWrapper}>
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
