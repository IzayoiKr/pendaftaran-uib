import axios, { AxiosError } from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface UserDTO {
    id: string;
    full_name: string;
    nik: string;
    email: string;
}

export interface AuthResponse {
    token: string;
    user: UserDTO;
}

const apiClient: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
})

apiClient.interceptors.response.use(
    (response) => response.data,
    (error: AxiosError<{ error?: string }>) => {
        const message = error.response?.data?.error ?? "Terjadi kesalahan";
        throw new Error(message);
    }
);

export const api = {
    auth: {
        login: (email: string, password: string) =>
            apiClient.post<AuthResponse>("/api/auth/login", { email, password }),
        register: (data: {
            full_name: string;
            nik: string;
            email: string;
            password: string;
        }) =>
            apiClient.post<never, AuthResponse>("/api/auth/register", data),
    }
}

export function saveSession(res: AuthResponse): void {
    localStorage.setItem("token", res.token);
    localStorage.setItem("user", JSON.stringify(res.user))
}

export function clearSession(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
}

export function getStoredUser(): UserDTO | null {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    try {
        return JSON.parse(raw) as UserDTO;
    } catch {
        return null;
    }
}
