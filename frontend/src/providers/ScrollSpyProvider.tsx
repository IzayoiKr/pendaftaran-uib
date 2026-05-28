"use client";
import { createContext, useCallback, useContext, useState } from "react";
import type { ReactNode } from "react";

interface ScrollSpyContextValue {
    ready: number;
    notify: () => void;
}

const ScrollSpyContext = createContext<ScrollSpyContextValue>({
    ready: 0,
    notify: () => {},
});

export function ScrollSpyProvider({ children }: { children: ReactNode }) {
    const [ready, setReady] = useState(0);
    const notify = useCallback(() => setReady((c) => c + 1), []);
    return (
        <ScrollSpyContext.Provider value={{ ready, notify }}>
            {children}
        </ScrollSpyContext.Provider>
    );
}

export const useScrollSpyContext = () => useContext(ScrollSpyContext);
