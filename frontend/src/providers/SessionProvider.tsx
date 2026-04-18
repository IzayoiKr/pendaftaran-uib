'use client';

import { useEffect } from "react";
import { Toaster } from "sonner";
import useAuthStore from "@/store/useAuthStore";


export default function SessionProvider({ children }: { children: React.ReactNode }) {
    const restoreSession = useAuthStore((state) => state.restoreSession);

    useEffect(() => {
        restoreSession();
    }, [restoreSession]);

    return (
        <>
            <Toaster
                toastOptions={{
                    classNames: {
                        toast: 'toast',
                        title: 'toast-title',
                        description: 'toast-desc',
                        closeButton: 'toast-closeBtn',
                    }
                }}
                position="top-center"
                richColors
                closeButton
                duration={4000}
            />
            {children}
        </>
    );
}
