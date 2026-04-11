import { useEffect, useRef } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import { toast } from "sonner";

export default function ProtectedRoute() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const isLoading = useAuthStore((state) => state.isLoading);
    
    const hasShownToast = useRef(false);
    const wasAuthenticated = useRef(isAuthenticated);

    useEffect(() => {
        // Only show the warning if they were NEVER authenticated during this session.
        // If wasAuthenticated.current is true, it means they just clicked "Logout", so skip the warning.
        if (!isLoading && !isAuthenticated && !hasShownToast.current && !wasAuthenticated.current) {
            toast.warning("Mohon untuk Login terlebih dahulu!");
            hasShownToast.current = true;
        }

        // Keep track of their previous auth state
        wasAuthenticated.current = isAuthenticated;
    }, [isLoading, isAuthenticated]);

    if (isLoading) return null;
    if (!isAuthenticated) return <Navigate to='/login' replace />;

    return <Outlet />;
}
