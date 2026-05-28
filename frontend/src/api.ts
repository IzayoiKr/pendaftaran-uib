import axios from "axios";
import type {
    AxiosError,
    AxiosInstance,
    InternalAxiosRequestConfig,
} from "axios";
import useAuthStore from "@/store/useAuthStore";
import type { AccessTokenResponse, User } from "@/types/api";

export class ApiError extends Error {
    requireCaptcha: boolean;
    requireVerify: boolean;
    email?: string;
    expired: boolean;

    constructor(
        message: string,
        requireCaptcha = false,
        requireVerify = false,
        email?: string,
        expired = false,
    ) {
        super(message);
        this.name = "ApiError";
        this.requireCaptcha = requireCaptcha;
        this.requireVerify = requireVerify;
        this.email = email;
        this.expired = expired;
    }
}

function getDeviceId(): string {
    if (typeof window === "undefined") return "";
    let id = localStorage.getItem("device_id");
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem("device_id", id);
    }
    return id;
}

const apiClient: AxiosInstance = axios.create({
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
    if (refreshPromise) return refreshPromise;

    refreshPromise = fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
    })
        .then(async (res) => {
            if (!res.ok) throw new ApiError("Refresh failed");
            const data: AccessTokenResponse = await res.json();
            useAuthStore.getState().setAccessToken(data.access_token);
            useAuthStore.getState().setUser(data.user);
            return data.access_token;
        })
        .finally(() => {
            refreshPromise = null;
        });

    return refreshPromise;
}

apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const { accessToken } = useAuthStore.getState();
        if (accessToken) {
            config.headers.set("Authorization", `Bearer ${accessToken}`);
        }
        return config;
    },
    (error) => Promise.reject(error),
);

interface RetryableRequest extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

apiClient.interceptors.response.use(
    (response) => response.data,
    async (
        error: AxiosError<{ error?: string; require_captcha?: boolean }>,
    ) => {
        const originalRequest = error.config as RetryableRequest;
        const authErrType = error.response?.headers["x-auth-error"];

        if (
            error.response?.status === 401 &&
            authErrType !== "credentials" &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;
            try {
                const newToken = await refreshAccessToken();
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return apiClient(originalRequest);
            } catch {
                useAuthStore.getState().logout();
                window.location.href = "/login";
                return Promise.reject(error);
            }
        }

        const data = error.response?.data as
            | {
                  error?: string;
                  require_captcha?: boolean;
                  require_verify?: boolean;
                  expired?: boolean;
                  email?: string;
              }
            | undefined;
        const message = data?.error ?? "Terjadi kesalahan";
        const requireCaptcha = data?.require_captcha ?? false;
        const requireVerify = data?.require_verify ?? false;
        const expired = data?.expired ?? false;
        return Promise.reject(
            new ApiError(
                message,
                requireCaptcha,
                requireVerify,
                data?.email,
                expired,
            ),
        );
    },
);

export const api = {
    auth: {
        login: (email: string, password: string, turnstileToken?: string) =>
            apiClient.post<never, AccessTokenResponse>("/api/auth/login", {
                email,
                password,
                ...(turnstileToken
                    ? { cf_turnstile_token: turnstileToken }
                    : {}),
            }),

        register: (data: {
            full_name: string;
            nik: string;
            email: string;
            password: string;
            cf_turnstile_token: string;
        }) =>
            apiClient.post<never, User>("/api/auth/register", data, {
                headers: { "X-Device-ID": getDeviceId() },
            }),

        logout: () =>
            apiClient.post<never, { message: string }>("/api/auth/logout"),

        forgotPassword: (email: string, turnstileToken: string) =>
            apiClient.post<never, { message: string }>(
                "/api/auth/forgot-password",
                {
                    email,
                    cf_turnstile_token: turnstileToken,
                },
                {
                    headers: { "X-Device-ID": getDeviceId() },
                },
            ),

        resetPassword: (token: string, newPassword: string) =>
            apiClient.post<never, { message: string }>(
                "/api/auth/reset-password",
                {
                    token,
                    new_password: newPassword,
                },
            ),

        verifyEmail: (token: string, turnstileToken: string) =>
            apiClient.post<never, { message: string }>(
                "/api/auth/verify-email",
                {
                    token,
                    cf_turnstile_token: turnstileToken,
                },
            ),

        resendVerification: (email: string) =>
            apiClient.post<never, { message: string }>(
                "/api/auth/resend-verification",
                { email },
            ),
    },

    profile: {
        get: () => apiClient.get<never, User>("/api/profile"),

        update: (data: { fullName: string }) =>
            apiClient.post<never, { message: string }>("/api/profile", {
                full_name: data.fullName,
            }),

        revealNIK: () =>
            apiClient.get<never, { nik: string }>("/api/profile/nik"),

        changePassword: (oldPassword: string, newPassword: string) =>
            apiClient.post<never, { message: string }>(
                "/api/profile/password",
                {
                    old_password: oldPassword,
                    new_password: newPassword,
                },
            ),
    },
};
