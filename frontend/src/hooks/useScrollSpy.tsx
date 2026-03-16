import { useEffect, useRef, useState } from "react";

interface UseScrollSpyProps {
    ids: string[],
    offset?: number
}

export default function useScrollSpy({ ids, offset = 80 }: UseScrollSpyProps) {
    const [activeId, setActiveId] = useState<string>('');

    const idsRef = useRef(ids);
    useEffect(() => { idsRef.current = ids });

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter(e => e.isIntersecting)
                    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
                if (visible.length > 0) {
                    setActiveId(visible[0].target.id);
                }
            },
            {
                rootMargin: `-${offset}px 0px -40% 0px`,
                threshold: 0
            }
        );

        idsRef.current.forEach(id => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        })

        return () => observer.disconnect();
    }, [offset])

    return activeId;
}
