'use client';

import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/api";
import { RightArrowIcon } from "@/components/Icons";
import styles from "./ForgotPassword.module.scss";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ForgotForm {
    email: string;
    nik:   string;
}

interface ForgotFormProps {
    onReset: (email: string, nik: string) => Promise<void>;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ForgotInput({ name, type, placeholder, autoComplete, value, onChange }: {
    name:         keyof ForgotForm;
    type:         "email" | "text";
    placeholder:  string;
    autoComplete: string;
    value:        string;
    onChange:     (e: React.ChangeEvent<HTMLInputElement>) => void;
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

function ForgotAction() {
    return (
        <button type="submit" className={styles.resetBtn}>
            Reset <RightArrowIcon />
        </button>
    );
}

function ForgotForm({ onReset }: ForgotFormProps) {
    const [email, setEmail] = useState("");
    const [nik,   setNik]   = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            await onReset(email, nik);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
        }
    };

    return (
        <form onSubmit={handleSubmit} noValidate>
            <ForgotInput
                name="email"
                type="email"
                placeholder="Email saat daftar (Registration Email) *"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <ForgotInput
                name="nik"
                type="text"
                placeholder="NIK saat daftar (Registration National Identification Number) *"
                autoComplete="off"
                value={nik}
                onChange={(e) => setNik(e.target.value)}
            />
            <ForgotAction />
        </form>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ForgotPassword() {
    const handleReset = async (email: string, nik: string) => {
        await api.auth.forgotPassword(email, nik); // TODO: pastikan endpoint ini ada
        toast.success("Email reset password telah dikirim!");
    };

    return (
        <main className={styles.forgot}>
            <div className={styles.container}>
                <h1>Lupa Password</h1>
                <p className={styles.required}>* Wajib di Isi (Required)</p>
                <ForgotForm onReset={handleReset} />
            </div>
        </main>
    );
}
