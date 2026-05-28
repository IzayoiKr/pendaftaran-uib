"use client";

import { useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { toast } from "sonner";
import { api } from "@/api";
import { forgotPasswordSchema } from "@/validation/auth";
import { RightArrowIcon } from "@/components/Icons/Icons";
import TurnstileWidget from "@/components/TurnstileWidget";
import type { TurnstileHandle } from "@/components/TurnstileWidget";
import styles from "./ForgotPassword.module.scss";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ForgotInputProps {
    value?: string;
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ForgotInput({ value, onChange }: ForgotInputProps) {
    const t = useTranslations("forgotPassword");

    return (
        <input
            id="email"
            name="email"
            type="email"
            placeholder={t("emailPlaceholder")}
            autoComplete="email"
            value={value}
            onChange={onChange}
            required
        />
    );
}

function ForgotAction({ isLoading }: { isLoading: boolean }) {
    const t = useTranslations("forgotPassword");

    return (
        <button
            type="submit"
            className={styles.resetBtn}
            disabled={isLoading}
            aria-busy={isLoading}
        >
            {t("button")} <RightArrowIcon />
        </button>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ForgotPassword() {
    const t = useTranslations("forgotPassword");
    const turnstileRef = useRef<TurnstileHandle>(null);

    const [form, setForm] = useState({ email: "" });
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const tv = useTranslations("validation");

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const valid = forgotPasswordSchema(tv).safeParse(form);
        if (!valid.success) {
            toast.error(valid.error.issues[0].message);
            return;
        }

        if (!turnstileToken) {
            toast.error(t("toast.captchaRequired"));
            turnstileRef.current?.reset();
            return;
        }

        setIsLoading(true);
        try {
            await api.auth.forgotPassword(form.email, turnstileToken);
            toast.success(t("toast.success"));
            setForm({ email: "" });
        } catch (err) {
            toast.error(err instanceof Error ? err.message : t("toast.error"));
            turnstileRef.current?.reset();
            setTurnstileToken(null);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className={styles.forgot}>
            <div className={styles.container}>
                <h1>{t("heading")}</h1>
                <form onSubmit={handleSubmit} noValidate>
                    <ForgotInput value={form.email} onChange={handleChange} />
                    <Link href="/login" className={styles.loginlink}>
                        {t("backToLogin")}
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
