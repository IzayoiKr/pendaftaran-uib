"use client";

import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import GetInitials from "@/utils/GetInitials";
import { toast } from "sonner";
import { api } from "@/api";
import useAuthStore from "@/store/useAuthStore";
import { updateProfileSchema } from "@/validation/auth";
import { RightArrowIcon } from "@/components/Icons/Icons";
import NIKReveal from "@/components/NIKReveal/NIKReveal";
import type { User } from "@/types/api";
import UpdateProfileSkeleton from "./UpdateProfile.skeleton";
import styles from "./UpdateProfile.module.scss";

interface InfoRowProps {
    label: string;
    value: string | ReactNode;
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
    );
}

function NameField({ id, value, onChange }: NameFieldProps) {
    const t = useTranslations("account.updateProfile");

    return (
        <input
            id={id}
            name={id}
            type="text"
            placeholder={t("namePlaceholder")}
            autoComplete="name"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required
            className={styles.input}
        />
    );
}

function SubmitButton({ isLoading }: { isLoading: boolean }) {
    const t = useTranslations("account.updateProfile");

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

function UpdateProfileHeader({ user }: { user: User }) {
    const t = useTranslations("account.updateProfile");
    const initials = user?.full_name ? GetInitials(user.full_name) : "?";

    return (
        <div className={styles.profileHeader}>
            <div className={styles.avatar} aria-hidden="true">
                {initials}
            </div>
            <h1 className={styles.title}>{t("heading")}</h1>
        </div>
    );
}

function UpdateProfileForm({ user }: { user: User }) {
    const router = useRouter();
    const { setUser } = useAuthStore();
    const [fullName, setFullName] = useState(user.full_name ?? "");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const tv = useTranslations("validation");
    const t = useTranslations("account.updateProfile");

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const valid = updateProfileSchema(tv).safeParse({ fullName: fullName });
        if (!valid.success) {
            toast.error(valid.error.issues[0].message);
            return;
        }

        setIsSubmitting(true);
        const toastId = toast.loading(t("toast.loading"));
        try {
            await api.profile.update({
                fullName: fullName,
            });

            if (user) {
                setUser({ ...user, full_name: fullName });
            }

            toast.success(t("toast.success"), { id: toastId });
            router.push("/account");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : t("toast.error"), {
                id: toastId,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form className={styles.formBody} onSubmit={handleSubmit} noValidate>
            <section className={styles.infoSection}>
                <h2 className={styles.sectionTitle}>{t("infoTitle")}</h2>
                <InfoRow
                    label={t("nikLabel")}
                    value={<NIKReveal masked={user.nik} />}
                />
                <InfoRow label={t("emailLabel")} value={user.email} />
            </section>

            <section className={styles.editSection}>
                <h2 className={styles.sectionTitle}>{t("editTitle")}</h2>

                <label htmlFor="namaLengkap" className={styles.fieldLabel}>
                    {t("nameLabel")}
                </label>
                <NameField
                    id="namaLengkap"
                    value={fullName}
                    onChange={setFullName}
                />

                <SubmitButton isLoading={isSubmitting} />
            </section>
        </form>
    );
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
