"use client";

import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ApiError, api } from "@/api";
import { resetPasswordSchema } from "@/validation/auth";
import ExpiredLink from "@/components/ExpiredLink/ExpiredLink";
import { RightArrowIcon } from "@/components/Icons/Icons";
import type { Form } from "@/types/ui";
import { resetPassword } from "./data";
import styles from "./ResetPassword.module.scss";

interface ResetForm {
    newPassword: string;
    confirmPassword: string;
}

function PasswordInput({
    type,
    name,
    placeholderKey,
    autoComplete,
    minLength,
    value,
    onChange,
}: Form) {
    const t = useTranslations("resetPassword");

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
    const t = useTranslations("resetPassword");

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

function ResetPasswordForm() {
    const t = useTranslations("resetPassword");
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams?.get("token") ?? "";
    const [isExpired, setIsExpired] = useState(false);

    const [form, setForm] = useState<ResetForm>({
        newPassword: "",
        confirmPassword: "",
    });
    const [isLoading, setIsLoading] = useState(false);

    if (!token || isExpired) {
        return <ExpiredLink type="reset-password" />;
    }

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const tv = useTranslations("validation");

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const valid = resetPasswordSchema(tv).safeParse(form);
        if (!valid.success) {
            toast.error(valid.error.issues[0].message);
            return;
        }

        setIsLoading(true);
        const toastId = toast.loading(t("toast.loading"));
        try {
            await api.auth.resetPassword(token, form.newPassword);
            toast.success(t("toast.success"), { id: toastId });
            router.push("/login");
        } catch (err) {
            const expired = err instanceof ApiError && err.expired;
            if (expired) {
                setIsExpired(true);
                return;
            }
            toast.error(err instanceof Error ? err.message : t("toast.error"), {
                id: toastId,
            });
        } finally {
            setIsLoading(false);
            toast.dismiss(toastId);
        }
    };

    return (
        <>
            <h1>{t("heading")}</h1>
            <form onSubmit={handleSubmit} noValidate>
                {resetPassword.map((props) => (
                    <PasswordInput
                        key={props.name}
                        {...props}
                        value={form[props.name as keyof typeof form]}
                        onChange={handleChange}
                    />
                ))}
                <SubmitAction isLoading={isLoading} />
            </form>
        </>
    );
}

export default function ResetPassword() {
    return (
        <main className={styles.resetPassword}>
            <div className={styles.container}>
                <ResetPasswordForm />
            </div>
        </main>
    );
}
