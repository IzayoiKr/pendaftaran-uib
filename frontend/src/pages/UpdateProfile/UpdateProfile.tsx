'use client';

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/api";
import useAuthStore from "@/store/useAuthStore";
import { updateProfileSchema } from "@/validation/schema";
import type { User } from "@/types/api";
import { RightArrowIcon } from "@/components/Icons/Icons";
import styles from "./UpdateProfile.module.scss";
import UpdateProfileSkeleton from "./UpdateProfile.skeleton";

interface InfoRowProps {
    label: string;
    value: string;
}

interface NameFieldProps {
    id: string;
    value: string;
    onChange: (v: string) => void;
}

function InfoRow({ label, value }: InfoRowProps) {
    return (
        <div className={styles.infoRow}>
            <div className={styles.infoContent}>
                <span className={styles.infoLabel}>{label}</span>
                <span className={styles.infoValue}>{value}</span>
            </div>
        </div>
    )
}

function NameField({ id, value, onChange }: NameFieldProps) {
    return (
        <input
            id={id}
            name={id}
            type="text"
            placeholder="Nama Lengkap (Fullname) *"
            autoComplete="name"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required
            className={styles.input}
        />
    );
}

function SubmitButton({ isLoading }: { isLoading: boolean }) {
    return (
        <button
            type="submit"
            className={styles.submitBtn}
            disabled={isLoading}
            aria-busy={isLoading}
        >
            Simpan Perubahan <RightArrowIcon />
        </button>
    );
}

function UpdateProfileHeader({ user }: { user: User }) {
    const initials = user?.full_name
        ? user.full_name
            .split(' ')
            .map(n => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()
        : user?.email?.[0]?.toUpperCase() ?? '?';

    return (
        <div className={styles.profileHeader}>
            <div className={styles.avatar} aria-hidden="true">
                {initials}
            </div>
            <h1 className={styles.title}>
                Ubah Profile Akun
                <span className={styles.subTitle}>(Change Account Profile)</span>
            </h1>
        </div>
    )
}

function UpdateProfileForm({ user }: { user: User }) {
    const router = useRouter();
    const { setUser } = useAuthStore();
    const [fullName, setFullName] = useState(user.full_name ?? "");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const valid = updateProfileSchema.safeParse({ fullName: fullName });
        if (!valid.success) {
            toast.error(valid.error.issues[0].message);
            return;
        }

        setIsSubmitting(true);
        const toastId = toast.loading("Profil sedang diupdate...")
        try {
            await api.profile.update({
                fullName: fullName,
            });

            if (user) {
                setUser({ ...user, full_name: fullName });
            }

            toast.success("Profil berhasil diperbarui!", { id: toastId });
            router.push("/account");
        } catch (err) {
            toast.error(
                err instanceof Error ? err.message : "Terjadi kesalahan",
                { id: toastId }
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form className={styles.formBody} onSubmit={handleSubmit} noValidate>
            <section className={styles.infoSection}>
                <h2 className={styles.sectionTitle}>Informasi Akun</h2>
                <InfoRow label="Nomor NIK" value={user.nik} />
                <InfoRow label="Alamat Email" value={user.email} />
            </section>

            <section className={styles.editSection}>
                <h2 className={styles.sectionTitle}>Edit Profile</h2>

                <label
                    htmlFor="namaLengkap"
                    className={styles.fieldLabel}
                >
                    Nama Lengkap
                </label>
                <NameField
                    id="namaLengkap"
                    value={fullName}
                    onChange={setFullName}
                />

                <SubmitButton isLoading={isSubmitting} />
            </section>
        </form>
    )
}

export default function UpdateProfile() {
    const { user, isLoading } = useAuthStore();

    if (isLoading) return <UpdateProfileSkeleton />;
    if (!user) return null;

    return (
        <main className={styles.updateProfile}>
            <div className={styles.container}>
                <UpdateProfileHeader user={user} />
                <UpdateProfileForm user={user} />
            </div>
        </main>
    );
}
