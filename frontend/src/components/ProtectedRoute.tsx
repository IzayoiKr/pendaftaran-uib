import { useEffect, useRef } from "react";
import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import { toast } from "sonner";

export default function ProtectedRoute() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const isLoading = useAuthStore((state) => state.isLoading);
    const hasShownToast = useRef(false);

    useEffect(() => {
        if (!isLoading && !isAuthenticated && !hasShownToast.current) {
            toast.warning("Mohon untuk Login terlebih dahulu!")
            hasShownToast.current = true;
        }
    }, [isLoading, isAuthenticated])

    if (isLoading) return null;
    if (!isAuthenticated) return <Navigate to='/login' replace />;

    return <Outlet />;
}
