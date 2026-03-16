import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToHash() {
    const { hash, pathname } = useLocation();

    useEffect(() => {
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
    }, [hash, pathname]);

    return null;
}
