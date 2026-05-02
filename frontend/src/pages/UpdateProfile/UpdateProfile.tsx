'use client';

import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/api";
import { RightArrowIcon } from "@/components/Icons/Icons";
import styles from "./UpdateProfile.module.scss";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProfileForm {
    namaLengkap: string;
    nik: string;
    email: string;
}

const FIELDS: {
    name: keyof ProfileForm;
    placeholder: string;
    type: "text" | "email";
    autoComplete: string;
    editable: boolean;
}[] = [
        { name: "namaLengkap", placeholder: "Nama Lengkap (Fullname) *", type: "text", autoComplete: "name", editable: true },
        { name: "nik", placeholder: "Nomor NIK", type: "text", autoComplete: "off", editable: false },
        { name: "email", placeholder: "Alamat Email", type: "email", autoComplete: "email", editable: false },
    ];

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProfileInput({ name, placeholder, type, autoComplete, value, editable, onChange }: {
    name: keyof ProfileForm;
    placeholder: string;
    type: "text" | "email";
    autoComplete: string;
    value: string;
    editable: boolean;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
    return (
        <input
            id={name}
            name={name}
            type={type}
            placeholder={editable ? placeholder : undefined}
            value={value}
            autoComplete={autoComplete}
            onChange={onChange}
            readOnly={!editable}
            required={editable}
        />
    );
}

function SubmitAction({ isLoading }: { isLoading: boolean }) {
    return (
        <button type="submit" className={styles.submitBtn} disabled={isLoading} aria-busy={isLoading}>
            {isLoading
                ? <><div className={styles.spinner} aria-hidden="true" /> Menyimpan...</>
                : <>Ubah Profile <RightArrowIcon /></>
            }
        </button>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UpdateProfile() {
    const router = useRouter();
    // TODO: pre-fill dari backend / auth context
    const [form, setForm] = useState<ProfileForm>({
        namaLengkap: "",
        nik: "",
        email: "",
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (FIELDS.find(f => f.name === name)?.editable) {
            setForm(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.profile.updateProfile({
                fullName: form.namaLengkap,
            });

            toast.success("Profil berhasil diperbarui!");

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
                <h1>Ubah Profile Akun (Change Account Profile)</h1>
                <p className={styles.required}>* Wajib di Isi (Required)</p>
                <form onSubmit={handleSubmit} noValidate>
                    {FIELDS.map(f => (
                        <ProfileInput
                            key={f.name}
                            name={f.name}
                            placeholder={f.placeholder}
                            type={f.type}
                            autoComplete={f.autoComplete}
                            value={form[f.name]}
                            editable={f.editable}
                            onChange={handleChange}
                        />
                    ))}
                    <SubmitAction isLoading={isLoading} />
                </form>
            </div>
        </main>
    );
}
