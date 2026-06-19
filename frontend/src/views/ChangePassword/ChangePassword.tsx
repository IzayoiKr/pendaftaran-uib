"use client";

import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/api";
import { changePasswordSchema } from "@/validation/auth";
import { RightArrowIcon } from "@/components/Icons/Icons";
import type { Form } from "@/types/ui";
import { changePassword } from "./data";
import styles from "./ChangePassword.module.scss";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PasswordForm {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PasswordInput({
    type,
    name,
    placeholderKey,
    autoComplete,
    minLength,
    value,
    onChange,
}: Form) {
    const t = useTranslations("account.changePassword");

    return (
        <input
            type={type}
            id={name}
            name={name}
            placeholder={placeholderKey ? t(placeholderKey) : ""}
            autoComplete={autoComplete}
            minLength={minLength}
            value={value}
            onChange={onChange}
            required
        />
    );
}

function SubmitAction({ isLoading }: { isLoading: boolean }) {
    const t = useTranslations("account.changePassword");

    return (
        <button
            type="submit"
            className={styles.submitBtn}
            disabled={isLoading}
            aria-busy={isLoading}
        >
            {t("button")} <RightArrowIcon />
        </button>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ChangePassword() {
    const router = useRouter();
    const [form, setForm] = useState<PasswordForm>({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const tv = useTranslations("validation");

    const t = useTranslations("account.changePassword");

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const valid = changePasswordSchema(tv).safeParse(form);
        if (!valid.success) {
            toast.error(valid.error.issues[0].message);
            return;
        }

        setIsLoading(true);
        try {
            await api.profile.changePassword(
                form.oldPassword,
                form.newPassword,
            );
            toast.success(t("toast.success"));
            router.push("/account");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : t("toast.error"));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className={styles.changePassword}>
            <div className={styles.container}>
                <h1>{t("heading")}</h1>
                <form onSubmit={handleSubmit} noValidate>
                    {changePassword.map((props) => (
                        <PasswordInput
                            key={props.name}
                            {...props}
                            value={form[props.name as keyof typeof form]}
                            onChange={handleChange}
                        />
                    ))}
                    <SubmitAction isLoading={isLoading} />
                </form>
            </div>
        </main>
    );
}
