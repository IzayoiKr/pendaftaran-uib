'use client';

import { useState, useRef } from "react";
import { toast } from "sonner";
import { api } from "@/api";
import { forgotPasswordSchema } from "@/validation/schema";
import TurnstileWidget from "@/components/TurnstileWidget";
import type { TurnstileHandle } from "@/components/TurnstileWidget";
import { RightArrowIcon } from "@/components/Icons/Icons";
import styles from "./ForgotPassword.module.scss";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ForgotForm {
    email: string;
    nik: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ForgotInput({ name, type, placeholder, autoComplete, value, onChange }: {
    name: keyof ForgotForm;
    type: "email" | "text";
    placeholder: string;
    autoComplete: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
    return (
        <input
            id={name}
            name={name}
            type={type}
            placeholder={placeholder}
            autoComplete={autoComplete}
            value={value}
            onChange={onChange}
            required
        />
    );
}

function ForgotAction({ isLoading }: { isLoading: boolean }) {
    return (
        <button
            type="submit"
            className={styles.resetBtn}
            disabled={isLoading}
            aria-busy={isLoading}
        >
            Reset Password <RightArrowIcon />
        </button>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ForgotPassword() {
    const turnstileRef = useRef<TurnstileHandle>(null);

    const [form, setForm] = useState<ForgotForm>({ email: "", nik: "" });
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const clean = name === "nik" ? value.replace(/\D/g, "") : value;
        setForm(prev => ({ ...prev, [name]: clean }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const valid = forgotPasswordSchema.safeParse(form);
        if (!valid.success) {
            toast.error(valid.error.issues[0].message);
            return;
        }

        if (!turnstileToken) {
            toast.error("Verifikasi CAPTCHA belum selesai, coba lagi");
            turnstileRef.current?.reset();
            return;
        }

        setIsLoading(true);
        try {
            await api.auth.forgotPassword(form.email, form.nik, turnstileToken);
            toast.success("Link reset password telah dikirim ke email Anda.");
            setForm({ email: "", nik: "" });
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
            turnstileRef.current?.reset();
            setTurnstileToken(null);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className={styles.forgot}>
            <div className={styles.container}>
                <h1>Lupa Password</h1>
                <p className={styles.required}>* Wajib di Isi (Required)</p>
                <form onSubmit={handleSubmit} noValidate>
                    <ForgotInput
                        name="email"
                        type="email"
                        placeholder="Email saat daftar (Registration Email) *"
                        autoComplete="email"
                        value={form.email}
                        onChange={handleChange}
                    />
                    <ForgotInput
                        name="nik"
                        type="text"
                        placeholder="NIK saat daftar (Registration National Identification Number) *"
                        autoComplete="off"
                        value={form.nik}
                        onChange={handleChange}
                    />
                    <TurnstileWidget
                        ref={turnstileRef}
                        onTokenChange={setTurnstileToken}
                        className={styles.turnstile}
                    />
                    <ForgotAction isLoading={isLoading} />
                </form>
            </div>
        </main>
    );
}
