'use client';

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import type { AccessTokenResponse, Form } from "@/types";
import { login } from "@/constants/data";
import { loginSchema } from "@/validation/schema";
import { api } from "@/api";
import useAuthStore from "@/store/useAuthStore";
import { RightArrowIcon } from "@/components/Icons";
import styles from "./Login.module.scss";

interface LoginFormProps {
    onLogin: (email: string, password: string) => Promise<AccessTokenResponse>;
}

interface LoginActionProps {
    isLoading: boolean;
}

function LoginPlaceholder({ name, type, placeholder, autoComplete, minLength, value, onChange }: Form) {
    return (
        <>
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
        </>
    )
}

function LoginAction({ isLoading }: LoginActionProps) {
    return (
        <>
            <Link href="/forgot" className={styles.forgotLink}>Lupa Password?</Link>

            <button type="submit" className={styles.loginBtn} disabled={isLoading} aria-busy={isLoading}>
                Login <RightArrowIcon />
            </button>

            <p className={styles.registerText}>
                Belum memiliki akun?{" "}
                <Link href="/register">Buat Akun</Link>
            </p>
        </>
    )
}

function LoginForm({ onLogin }: LoginFormProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const valid = loginSchema.safeParse({ email, password });
        if (!valid.success) {
            toast.error(valid.error.issues[0].message);
            return;
        }

        setIsLoading(true);
        const toastId = toast.loading("Sedang login...");
        try {
            await onLogin(email, password);
            toast.success("Login berhasil!", { id: toastId });
        } catch (err) {
            toast.error(
                err instanceof Error ? err.message : "Login gagal! Coba lagi...",
                { id: toastId }
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit} noValidate>
                {login.map((props) => {
                    const isEmail = props.name === "email";

                    return (
                        <LoginPlaceholder
                            key={props.name}
                            {...props}
                            value={isEmail ? email : password}
                            onChange={(e) => (isEmail ? setEmail : setPassword)(e.target.value)}
                        />
                    );
                })}
                <LoginAction isLoading={isLoading} />
            </form>

        </>
    )
}

export default function Login() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const login = useAuthStore((state) => state.login);

    const url = searchParams?.get('from') || '/';

    const handleLogin = async (email: string, password: string) => {
        const res = await api.auth.login(email, password);
        login(res.user, res.access_token);
        router.push(url);
        return res;
    }

    return (
        <main id="login" className={styles.login}>
            <div className={styles.container}>
                <h1>LOGIN</h1>
                <LoginForm onLogin={handleLogin} />
            </div>
        </main>
    );
}
