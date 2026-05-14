'use client';

import type { ReactNode } from "react";
import useRequireAuth from "@/hooks/useRequireAuth";

interface AuthGuardProps {
    children: ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
    const { user, isLoading } = useRequireAuth();
    if (isLoading) return <>{children}</>;
    if (!user) return null;
    return <>{children}</>;
}
