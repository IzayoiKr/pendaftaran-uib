import axios from 'axios';
import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { User, AccessTokenResponse } from '@/types';
import useAuthStore from '@/store/useAuthStore';

const apiClient: AxiosInstance = axios.create({
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
});

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
    if (refreshPromise) return refreshPromise;

    refreshPromise = fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include'
    })
        .then(async (res) => {
            if (!res.ok) throw new Error('Refresh failed');
            const data: { access_token: string; user: User } = await res.json();
            useAuthStore.getState().setAccessToken(data.access_token);
            useAuthStore.getState().setUser(data.user);
            return data.access_token;
        })
        .finally(() => {
            refreshPromise = null;
        });

    return refreshPromise;
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
}, (error) => Promise.reject(error));

interface RetryableRequest extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

apiClient.interceptors.response.use(
    (response) => response.data,
    async (error: AxiosError<{ error?: string }>) => {
        const originalRequest = error.config as RetryableRequest;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const newToken = await refreshAccessToken();
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return apiClient(originalRequest);

            } catch {
                useAuthStore.getState().logout();
                window.location.href = '/login';
                return Promise.reject(error);
            }
        }

        const message = error.response?.data?.error ?? 'Terjadi kesalahan';
        return Promise.reject(new Error(message));
    }
);

export const api = {
    auth: {
        login: (email: string, password: string) =>
            apiClient.post<never, AccessTokenResponse>("/api/auth/login", { email, password }),

        register: (data: {
            full_name: string;
            nik: string;
            email: string;
            password: string;
            cf_turnstile_token: string;
        }) =>
            apiClient.post<never, AccessTokenResponse>("/api/auth/register", data),

        logout: () =>
            apiClient.post<never, { message: string }>("/api/auth/logout"),
    }
};
