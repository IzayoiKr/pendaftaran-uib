'use client';

import type { ReactNode } from "react";
import useRequireAuth from "@/hooks/useRequireAuth";
import Loading from "@/components/Loading/Loading";

interface AuthGuardProps {
    children: ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
    const { user, isLoading, isLoggingOut } = useRequireAuth();
    if (isLoading || !user || isLoggingOut) return <Loading />;
    return <>{children}</>;
}
