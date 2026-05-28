import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";

export function useRevealNik() {
    return useQuery({
        queryKey: ["profile", "nik"],
        queryFn: () => api.profile.revealNIK(),
        staleTime: Infinity,
        gcTime: Infinity,
        retry: 1,
    });
}
