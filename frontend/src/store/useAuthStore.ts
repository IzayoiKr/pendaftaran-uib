import { create } from "zustand";
import type { AccessTokenResponse, AuthState, User } from "@/types/api";

interface AuthActions {
    login: (user: User, accessToken: string) => void;
    logout: () => void;
    setAccessToken: (token: string) => void;
    setUser: (user: User) => void;
    setLoading: (isLoading: boolean) => void;
    restoreSession: () => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

async function fetchWithRetry(
    url: string,
    options: RequestInit,
    maxRetries = 3,
    baseDelayMs = 500,
): Promise<Response> {
    let lastError: unknown;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const response = await fetch(url, options);

            if (response.status < 500) {
                return response;
            }

            lastError = new Error(`Server error ${response.status}`);
        } catch (err) {
            lastError = err;
        }

        if (attempt < maxRetries - 1) {
            await new Promise<void>((resolve) =>
                setTimeout(resolve, baseDelayMs * Math.pow(2, attempt)),
            );
        }
    }

    throw lastError;
}

const useAuthStore = create<AuthStore>((set) => ({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: true,
    isLoggingOut: false,

    login: (user, accessToken) =>
        set({
            user,
            accessToken,
            isAuthenticated: true,
            isLoading: false,
        }),

    logout: () =>
        set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            isLoading: false,
            isLoggingOut: true,
        }),

    setAccessToken: (token) => set({ accessToken: token }),

    setUser: (user) => set({ user }),

    setLoading: (isLoading) => set({ isLoading }),

    restoreSession: async () => {
        set({ isLoading: true });
        try {
            const response = await fetchWithRetry("/api/auth/refresh", {
                method: "POST",
                credentials: "include",
            });

            if (response.ok) {
                const data: AccessTokenResponse = await response.json();
                set({
                    user: data.user,
                    accessToken: data.access_token,
                    isAuthenticated: true,
                    isLoading: false,
                });
            } else {
                set({ isLoading: false });
            }
        } catch {
            set({ isLoading: false });
        }
    },
}));

export default useAuthStore;
