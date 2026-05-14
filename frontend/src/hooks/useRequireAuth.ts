'use client';

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import useAuthStore from "@/store/useAuthStore";

export default function useRequireAuth() {
    const { user, isLoading, isLoggingOut, restoreSession } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname() ?? "";
    const hasRestored = useRef(false);

    useEffect(() => {
        if (!isLoading && !user && !hasRestored.current) {
            hasRestored.current = true;
            restoreSession();
        }
    }, [isLoading, user, restoreSession]);

    useEffect(() => {
        if (!isLoading && !isLoggingOut && !user && hasRestored.current) {
            toast.warning("Mohon login terlebih dahulu!");
            router.push(`/login?from=${encodeURIComponent(pathname)}`);
        }
    }, [isLoading, isLoggingOut, user, router, pathname])

    return { user, isLoading };
}
