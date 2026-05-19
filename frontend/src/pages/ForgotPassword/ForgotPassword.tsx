'use client';

import { useState, useRef } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { toast } from "sonner";
import { api } from "@/api";
import { forgotPasswordSchema } from "@/validation/schema";
import TurnstileWidget from "@/components/TurnstileWidget";
import type { TurnstileHandle } from "@/components/TurnstileWidget";
import { RightArrowIcon } from "@/components/Icons/Icons";
import styles from "./ForgotPassword.module.scss";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ForgotInputProps {
    value?: string;
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ForgotInput({ value, onChange }: ForgotInputProps) {
    return (
        <input
            id="email"
            name="email"
            type="email"
            placeholder="Email saat daftar (Registration Email) *"
            autoComplete="email"
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

    const [form, setForm] = useState({ email: "" });
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
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
            await api.auth.forgotPassword(form.email, turnstileToken);
            toast.success("Link reset password telah dikirim ke email Anda.");
            setForm({ email: "" });
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
                <form onSubmit={handleSubmit} noValidate>
                    <ForgotInput
                        value={form.email}
                        onChange={handleChange}
                    />
                    <Link href="/login" className={styles.loginlink}>
                        Back to Login
                    </Link>
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
