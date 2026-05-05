'use client';

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import TurnstileWidget from "@/components/TurnstileWidget";
import type { TurnstileHandle } from "@/components/TurnstileWidget";
import type { Form } from "@/types";
import { register } from "@/constants/data";
import { registerSchema } from "@/validation/schema";
import { api } from "@/api";
import { RightArrowIcon } from "@/components/Icons/Icons";
import styles from "./Register.module.scss";

interface RegisterActionProps {
    isLoading: boolean;
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
            toast.success("Registrasi berhasil! Silahkan cek email Anda untuk verifikasi", { id: toastId });
            router.push(`/check-inbox?email=${encodeURIComponent(formData.email)}&from=register`)
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
                    <TurnstileWidget
                        ref={turnstileRef}
                        onTokenChange={setTurnstileToken}
                        className={styles.turnstile}
                    />
                    <RegisterAction isLoading={isLoading} />
                </form>
            </div>
        </section>
    );
}
