'use client';

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/api";
import { RightArrowIcon } from "@/components/Icons";
import styles from "./UbahPasswordPage.module.scss";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PasswordForm {
    oldPassword:     string;
    newPassword:     string;
    confirmPassword: string;
}

const FIELDS: { name: keyof PasswordForm; placeholder: string }[] = [
    { name: "oldPassword",     placeholder: "Password Lama (Old Password) *"                       },
    { name: "newPassword",     placeholder: "Password Baru (New Password) *"                       },
    { name: "confirmPassword", placeholder: "Konfirmasi Password Baru (Confirm New Password) *"    },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function PasswordInput({ name, placeholder, value, onChange }: {
    name:        keyof PasswordForm;
    placeholder: string;
    value:       string;
    onChange:    (e: ChangeEvent<HTMLInputElement>) => void;
}) {
    return (
        <input
            type="password"
            id={name}
            name={name}
            placeholder={placeholder}
            value={value}
            autoComplete={name === "oldPassword" ? "current-password" : "new-password"}
            onChange={onChange}
            minLength={8}
            required
        />
    );
}

function SubmitAction({ isLoading }: { isLoading: boolean }) {
    return (
        <button type="submit" className={styles.submitBtn} disabled={isLoading} aria-busy={isLoading}>
            {isLoading
                ? <><div className={styles.spinner} aria-hidden="true" /> Menyimpan...</>
                : <>Ubah Password <RightArrowIcon /></>
            }
        </button>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UbahPasswordPage() {
    const router = useRouter();
    const [form, setForm] = useState<PasswordForm>({ oldPassword: "", newPassword: "", confirmPassword: "" });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (form.newPassword !== form.confirmPassword) {
            toast.error("Password baru dan konfirmasi tidak cocok.");
            return;
        }

        setIsLoading(true);
        try {
            await api.auth.changePassword(form.oldPassword, form.newPassword); // TODO: pastikan endpoint ini ada
            toast.success("Password berhasil diubah!");
            router.push("/account");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <h1>Ubah Password (Change Password)</h1>
                <p className={styles.required}>* Wajib di Isi (Required)</p>
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
            </div>
        </main>
    );
}
