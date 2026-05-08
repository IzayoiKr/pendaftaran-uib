'use client';

import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Form } from "@/types/ui";
import { changePassword } from "./data";
import { toast } from "sonner";
import { api } from "@/api";
import { changePasswordSchema } from "@/validation/schema";
import { RightArrowIcon } from "@/components/Icons/Icons";
import styles from "./ChangePassword.module.scss";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PasswordForm {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PasswordInput({ type, name, placeholder, autoComplete, minLength, value, onChange }: Form) {
    return (
        <input
            type={type}
            id={name}
            name={name}
            placeholder={placeholder}
            autoComplete={autoComplete}
            minLength={minLength}
            value={value}
            onChange={onChange}
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
            Ubah Password <RightArrowIcon />
        </button>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ChangePassword() {
    const router = useRouter();
    const [form, setForm] = useState<PasswordForm>({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const valid = changePasswordSchema.safeParse(form);
        if (!valid.success) {
            toast.error(valid.error.issues[0].message);
            return;
        }

        setIsLoading(true);
        try {
            await api.profile.changePassword(form.oldPassword, form.newPassword);
            toast.success("Password berhasil diubah!");
            router.push("/account");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className={styles.changePassword}>
            <div className={styles.container}>
                <h1>Ubah Password (Change Password)</h1>
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
