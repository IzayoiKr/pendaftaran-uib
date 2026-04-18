import { create } from "zustand";
import type { User, AuthState, AccessTokenResponse } from "@/types";

interface AuthActions {
    login: (user: User, accessToken: string) => void;
    logout: () => void;
    setAccessToken: (token: string) => void;
    setUser: (user: User) => void;
    setLoading: (isLoading: boolean) => void;
    restoreSession: () => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

const useAuthStore = create<AuthStore>((set) => ({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: true,

    login: (user, accessToken) => set({
        user,
        accessToken,
        isAuthenticated: true,
        isLoading: false,
    }),
    logout: () => set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
    }),
    setAccessToken: (token) => set({ accessToken: token }),
    setUser: (user) => set({ user }),
    setLoading: (isLoading) => set({ isLoading }),
    restoreSession: async () => {
        set({ isLoading: true });
        try {
            const response = await fetch('/api/auth/refresh', {
                method: 'POST',
                credentials: 'include',
            });
            if (response.ok) {
                const data: AccessTokenResponse = await response.json();
                set({
                    user: data.user,
                    accessToken: data.access_token,
                    isAuthenticated: true,
                    isLoading: false,
                })
            } else {
                set({ isLoading: false });
            }
        } catch {
            set({ isLoading: false });
        }
    }
}))

export default useAuthStore;
