'use client';

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollToHash() {
    const pathname = usePathname();

    useEffect(() => {
        const hash = window.location.hash;
        if (!hash) return;

        const id = hash.replace("#", "");
        const timer = setTimeout(() => {
            const element = document.getElementById(id);
            if (!element) return;

            const header = document.querySelector<HTMLElement>('header');
            const headerHeight = header?.offsetHeight ?? 80;
            const elementTop = element.getBoundingClientRect().top + window.scrollY;

            window.scrollTo({
                top: elementTop - headerHeight,
                behavior: "smooth"
            })
        }, 100)

        return () => clearTimeout(timer);
    }, [pathname]);

    return null;
}
