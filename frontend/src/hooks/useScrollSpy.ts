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
        const intersecting = new Set<string>();
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        intersecting.add(entry.target.id);
                    } else {
                        intersecting.delete(entry.target.id);
                    }
                })

                if (intersecting.size === 0) {
                    setActiveId('');
                    return;
                }

                const topmost = [...intersecting]
                    .map(id => document.getElementById(id))
                    .filter((el): el is HTMLElement => el !== null)
                    .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)[0];

                if (topmost) setActiveId(topmost.id);
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
