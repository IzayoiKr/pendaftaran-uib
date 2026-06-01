"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import useAuthStore from "@/store/useAuthStore";

export default function useRequireAuth() {
    const { user, isLoading } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname() ?? "";

    useEffect(() => {
        if (!isLoading && !user) {
            toast.warning("Mohon login terlebih dahulu!");
            router.push(`/login?from=${encodeURIComponent(pathname)}`);
        }
    }, [isLoading, user, router, pathname]);

    return { user, isLoading };
}
