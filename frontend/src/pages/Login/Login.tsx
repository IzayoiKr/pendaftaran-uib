'use client';

import { useState, useRef, forwardRef, useImperativeHandle } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Turnstile } from "@marsidev/react-turnstile";
import type { TurnstileInstance } from "@marsidev/react-turnstile";
import type { AccessTokenResponse, Form } from "@/types";
import { login as loginFields } from "@/constants/data";
import { loginSchema } from "@/validation/schema";
import { api, ApiError } from "@/api";
import useAuthStore from "@/store/useAuthStore";
import { RightArrowIcon } from "@/components/Icons";
import styles from "./Login.module.scss";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY as string;

interface LoginFormProps {
    onLogin: (
        email: string,
        password: string,
        turnstileToken?: string,
    ) => Promise<AccessTokenResponse>;
}

interface LoginActionProps {
    isLoading: boolean;
    requireCaptcha: boolean;
}

interface TurnstileHandle {
    reset: () => void;
}

interface LoginTurnstileProps {
    onTokenChange: (token: string | null) => void;
}

function LoginPlaceholder({
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

const LoginTurnstile = forwardRef<TurnstileHandle, LoginTurnstileProps>(
    ({ onTokenChange }, ref) => {
        const turnstileRef = useRef<TurnstileInstance>(null);

        useImperativeHandle(ref, () => ({
            reset: () => turnstileRef.current?.reset(),
        }));

        return (
            <div className={styles.turnstile}>
                <Turnstile
                    ref={turnstileRef}
                    siteKey={SITE_KEY}
                    onSuccess={(token) => onTokenChange(token)}
                    onExpire={() => onTokenChange(null)}
                    onError={() => {
                        onTokenChange(null);
                        toast.error("Verifikasi CAPTCHA gagal, coba muat ulang halaman");
                    }}
                    options={{ theme: "light", language: "id" }}
                />
            </div>
        );
    },
);
LoginTurnstile.displayName = "LoginTurnstile";

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

function LoginForm({ onLogin }: LoginFormProps) {
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

            if (requireCaptcha) {
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
                    <LoginPlaceholder
                        key={props.name}
                        {...props}
                        value={isEmail ? email : password}
                        onChange={(e) =>
                            (isEmail ? setEmail : setPassword)(e.target.value)
                        }
                    />
                );
            })}

            <Link href="/forgot" className={styles.forgotLink}>
                Lupa Password?
            </Link>

            <div
                style={{ display: requireCaptcha ? "block" : "none" }}
                aria-hidden={!requireCaptcha}
            >
                <LoginTurnstile
                    ref={turnstileRef}
                    onTokenChange={setTurnstileToken}
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

    const handleLogin = async (
        email: string,
        password: string,
        turnstileToken?: string,
    ): Promise<AccessTokenResponse> => {
        const res = await api.auth.login(email, password, turnstileToken);
        loginStore(res.user, res.access_token);
        router.push(url);
        return res;
    };

    return (
        <main id="login" className={styles.login}>
            <div className={styles.container}>
                <h1>LOGIN</h1>
                <LoginForm onLogin={handleLogin} />
            </div>
        </main>
    );
}
