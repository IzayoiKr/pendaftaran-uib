'use client';

import { useState, useRef, forwardRef, useImperativeHandle } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Turnstile } from "@marsidev/react-turnstile";
import type { TurnstileInstance } from "@marsidev/react-turnstile";
import type { Form } from "@/types";
import { register } from "@/constants/data";
import { registerSchema } from "@/validation/schema";
import { api } from "@/api";
import { RightArrowIcon } from "@/components/Icons";
import styles from "./Register.module.scss";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY as string;

interface RegisterTurnstileProps {
    onTokenChange: (token: string | null) => void;
}

interface RegisterActionProps {
    isLoading: boolean;
}

interface TurnstileHandle {
    reset: () => void;
}

function RegisterField({ label, type, name, value, autoComplete, minLength, maxLength, onChange }: Form) {
    return (
        <>
            <label htmlFor={name}>{label}</label>
            <input
                id={name}
                type={type}
                name={name}
                value={value}
                autoComplete={autoComplete}
                minLength={minLength}
                maxLength={maxLength}
                onChange={onChange}
                required
            />
        </>
    );
}

const RegisterTurnstile = forwardRef<TurnstileHandle, RegisterTurnstileProps>(
    ({ onTokenChange }, ref) => {
        const turnstileRef = useRef<TurnstileInstance>(null);

        useImperativeHandle(ref, () => ({
            reset: () => {
                turnstileRef.current?.reset();
            }
        }))

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
        )
    }
);

RegisterTurnstile.displayName = "RegisterTurnstile";

function RegisterAction({ isLoading }: RegisterActionProps) {
    return (
        <>
            <button type="submit" className={styles.registerBtn} disabled={isLoading} aria-busy={isLoading}>
                Daftar (Register) <RightArrowIcon />
            </button>
            <p className={styles.backLogin}>
                Sudah memiliki akun?{" "}
                <Link href="/login">Login</Link>
            </p>
        </>
    );
}

export default function Register() {
    const router = useRouter();
    const turnstileRef = useRef<TurnstileHandle>(null);

    const [formData, setFormData] = useState({
        fullName: "",
        nik: "",
        email: "",
        password: "",
        retypePassword: ""
    })

    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (name: string, value: string) => {
        const cleanValue = name === "nik" ? value.replace(/\D/g, "") : value;
        setFormData(prev => ({ ...prev, [name]: cleanValue }));
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const valid = registerSchema.safeParse(formData);
        if (!valid.success) {
            toast.error(valid.error.issues[0].message);
            return;
        }

        if (!turnstileToken) {
            toast.error("Verifikasi CAPTCHA belum selesai, coba lagi");
            turnstileRef.current?.reset();
            return;
        }
        const { fullName, nik, email, password } = formData;

        setIsLoading(true);
        const toastId = toast.loading("Sedang register...")
        try {
            await api.auth.register({
                full_name: fullName,
                nik,
                email,
                password,
                cf_turnstile_token: turnstileToken
            });
            toast.success("Registrasi berhasil! Silahkan login kembali", { id: toastId });
            router.push("/login");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Registrasi gagal! Coba lagi...", { id: toastId });
            turnstileRef.current?.reset();
            setTurnstileToken(null);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className={styles.register}>
            <div className={styles.container}>
                <h1>Register Akun Baru</h1>
                <p>* Wajib di Isi (Required)</p>
                <form onSubmit={handleSubmit} noValidate>
                    {register.map((props) => (
                        <RegisterField
                            key={props.name}
                            {...props}
                            value={formData[props.name as keyof typeof formData]}
                            onChange={(e) => handleChange(props.name, e.target.value)}
                        />
                    ))}
                    <RegisterTurnstile
                        ref={turnstileRef}
                        onTokenChange={setTurnstileToken}
                    />
                    <RegisterAction isLoading={isLoading} />
                </form>
            </div>
        </section>
    );
}
