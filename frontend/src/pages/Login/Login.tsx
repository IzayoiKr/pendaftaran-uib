'use client';

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import type { AccessTokenResponse } from "@/types/api";
import type { Form } from "@/types/ui";
import { login as loginFields } from "./data";
import { loginSchema } from "@/validation/schema";
import TurnstileWidget from "@/components/TurnstileWidget";
import type { TurnstileHandle } from "@/components/TurnstileWidget";
import { api, ApiError } from "@/api";
import useAuthStore from "@/store/useAuthStore";
import { RightArrowIcon } from "@/components/Icons/Icons";
import styles from "./Login.module.scss";

interface LoginFormProps {
    onLogin: (
        email: string,
        password: string,
        turnstileToken?: string,
    ) => Promise<AccessTokenResponse>;
    router: ReturnType<typeof useRouter>;
}

interface LoginActionProps {
    isLoading: boolean;
    requireCaptcha: boolean;
}

function LoginInput({
    name, type, placeholder, autoComplete, minLength, value, onChange,
}: Form) {
    return (
        <input
            id={name}
            name={name}
            type={type}
            placeholder={placeholder}
            autoComplete={autoComplete}
            minLength={minLength}
            value={value}
            onChange={onChange}
            required
        />
    );
}

function LoginAction({ isLoading, requireCaptcha }: LoginActionProps) {
    return (
        <>
            {requireCaptcha && (
                <p className={styles.captchaHint}>
                    Selesaikan verifikasi di atas untuk melanjutkan.
                </p>
            )}

            <button
                type="submit"
                className={styles.loginBtn}
                disabled={isLoading}
                aria-busy={isLoading}
            >
                Login <RightArrowIcon />
            </button>

            <p className={styles.registerText}>
                Belum memiliki akun?{" "}
                <Link href="/register">Buat Akun</Link>
            </p>
        </>
    );
}

function LoginForm({ onLogin, router }: LoginFormProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [requireCaptcha, setRequireCaptcha] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
    const turnstileRef = useRef<TurnstileHandle>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const valid = loginSchema.safeParse({ email, password });
        if (!valid.success) {
            toast.error(valid.error.issues[0].message);
            return;
        }

        if (requireCaptcha && !turnstileToken) {
            toast.error("Selesaikan verifikasi CAPTCHA terlebih dahulu");
            return;
        }

        setIsLoading(true);
        const toastId = toast.loading("Sedang login...");

        try {
            await onLogin(email, password, turnstileToken ?? undefined);
            toast.success("Login berhasil!", { id: toastId });
        } catch (err) {
            const needsCaptchaReset = (err instanceof ApiError && err.requireCaptcha) || requireCaptcha;

            if (err instanceof ApiError && err.requireVerify) {
                const params = new URLSearchParams({
                    email: err.email ?? email,
                    from: 'login',
                });
                toast.warning(
                    "Email belum diverifikasi, mohon verifikasi email terlebih dahulu",
                    { id: toastId }
                );
                router.push(`/check-inbox?${params.toString()}`);
                return;
            }

            if (err instanceof ApiError && err.requireCaptcha) {
                setRequireCaptcha(true);
                toast.warning(
                    "Terlalu banyak percobaan gagal — selesaikan verifikasi untuk melanjutkan",
                    { id: toastId },
                );
            } else {
                toast.error(
                    err instanceof Error ? err.message : "Login gagal! Coba lagi...",
                    { id: toastId },
                );
            }

            if (needsCaptchaReset) {
                turnstileRef.current?.reset();
                setTurnstileToken(null);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} noValidate>
            {loginFields.map((props) => {
                const isEmail = props.name === "email";
                return (
                    <LoginInput
                        key={props.name}
                        {...props}
                        value={isEmail ? email : password}
                        onChange={(e) =>
                            (isEmail ? setEmail : setPassword)(e.target.value)
                        }
                    />
                );
            })}

            <Link href="/forgot-password" className={styles.forgotLink}>
                Lupa Password?
            </Link>

            <div
                style={{ display: requireCaptcha ? "block" : "none" }}
                aria-hidden={!requireCaptcha}
            >
                <TurnstileWidget
                    ref={turnstileRef}
                    onTokenChange={setTurnstileToken}
                    className={styles.turnstile}
                />
            </div>

            <LoginAction isLoading={isLoading} requireCaptcha={requireCaptcha} />
        </form>
    );
}

export default function Login() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const loginStore = useAuthStore((state) => state.login);

    const url = searchParams?.get("from") || "/";
    const safeUrl = url.startsWith('/') && !url.startsWith('//') ? url : '/';

    const handleLogin = async (
        email: string,
        password: string,
        turnstileToken?: string,
    ): Promise<AccessTokenResponse> => {
        const res = await api.auth.login(email, password, turnstileToken);
        loginStore(res.user, res.access_token);
        router.push(safeUrl);
        return res;
    };

    return (
        <main id="login" className={styles.login}>
            <div className={styles.container}>
                <h1>LOGIN</h1>
                <LoginForm
                    onLogin={handleLogin}
                    router={router}
                />
            </div>
        </main>
    );
}
