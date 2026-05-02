'use client';

import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { api, ApiError } from "@/api";
import { resetPasswordSchema } from "@/validation/schema";
import ExpiredLink from "@/components/ExpiredLink";
import { RightArrowIcon } from "@/components/Icons/Icons";
import styles from "./ResetPassword.module.scss";

interface ResetForm {
    newPassword: string;
    confirmPassword: string;
}

const FIELDS: { name: keyof ResetForm; placeholder: string }[] = [
    { name: "newPassword", placeholder: "Password Baru (New Password) *" },
    { name: "confirmPassword", placeholder: "Konfirmasi Password Baru (Confirm New Password) *" },
];

function PasswordInput({ name, placeholder, value, onChange }: {
    name: keyof ResetForm;
    placeholder: string;
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
    return (
        <input
            type="password"
            id={name}
            name={name}
            placeholder={placeholder}
            value={value}
            autoComplete="new-password"
            onChange={onChange}
            minLength={8}
            required
        />
    );
}

function SubmitAction({ isLoading }: { isLoading: boolean }) {
    return (
        <button
            type="submit"
            className={styles.submitBtn}
            disabled={isLoading}
            aria-busy={isLoading}
        >
            Reset Password <RightArrowIcon />
        </button>
    );
}

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams?.get("token") ?? "";
    const [isExpired, setIsExpired] = useState(false);

    const [form, setForm] = useState<ResetForm>({ newPassword: "", confirmPassword: "" });
    const [isLoading, setIsLoading] = useState(false);

    if (!token || isExpired) {
        return <ExpiredLink type="reset-password" />;
    }

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const valid = resetPasswordSchema.safeParse(form);
        if (!valid.success) {
            toast.error(valid.error.issues[0].message);
            return;
        }

        setIsLoading(true);
        const toastId = toast.loading("Sedang reset password...")
        try {
            await api.auth.resetPassword(token, form.newPassword);
            toast.success("Password berhasil direset! Silahkan login kembali.", { id: toastId });
            router.push("/login");
        } catch (err) {
            const expired = err instanceof ApiError && err.expired;
            if (expired) {
                setIsExpired(true);
                return;
            }
            toast.error(err instanceof Error ? err.message : 'Terjadi kesalahan', { id: toastId });
        } finally {
            setIsLoading(false);
            toast.dismiss(toastId);
        }
    };

    return (
        <>
            <h1>Reset Password</h1>
            <form onSubmit={handleSubmit} noValidate>
                {FIELDS.map(f => (
                    <PasswordInput
                        key={f.name}
                        name={f.name}
                        placeholder={f.placeholder}
                        value={form[f.name]}
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
