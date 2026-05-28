"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/api";
import { registerSchema } from "@/validation/auth";
import { RightArrowIcon } from "@/components/Icons/Icons";
import TurnstileWidget from "@/components/TurnstileWidget";
import type { TurnstileHandle } from "@/components/TurnstileWidget";
import type { Form } from "@/types/ui";
import { register } from "./data";
import styles from "./Register.module.scss";

interface RegisterActionProps {
    isLoading: boolean;
}

function RegisterField({
    labelKey,
    type,
    name,
    value,
    autoComplete,
    minLength,
    maxLength,
    onChange,
}: Form) {
    const t = useTranslations("register");

    return (
        <>
            <label htmlFor={name}>{labelKey ? t(labelKey) : name}</label>
            <input
                id={name}
                type={type}
                name={name}
                value={value}
                autoComplete={autoComplete}
                minLength={minLength}
                maxLength={maxLength}
                onChange={onChange}
                required
            />
        </>
    );
}

function RegisterAction({ isLoading }: RegisterActionProps) {
    const t = useTranslations("register");

    return (
        <>
            <button
                type="submit"
                className={styles.registerBtn}
                disabled={isLoading}
                aria-busy={isLoading}
            >
                {t("button")} <RightArrowIcon />
            </button>
            <p className={styles.backLogin}>
                {t("hasAccount")} <Link href="/login">{t("loginLink")}</Link>
            </p>
        </>
    );
}

export default function Register() {
    const t = useTranslations("register");
    const router = useRouter();
    const turnstileRef = useRef<TurnstileHandle>(null);

    const [formData, setFormData] = useState({
        fullName: "",
        nik: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (name: string, value: string) => {
        const cleanValue = name === "nik" ? value.replace(/\D/g, "") : value;
        setFormData((prev) => ({ ...prev, [name]: cleanValue }));
    };

    const tv = useTranslations("validation");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const valid = registerSchema(tv).safeParse(formData);
        if (!valid.success) {
            toast.error(valid.error.issues[0].message);
            return;
        }

        if (!turnstileToken) {
            toast.error(t("toast.captchaRequired"));
            turnstileRef.current?.reset();
            return;
        }
        const { fullName, nik, email, password } = formData;

        setIsLoading(true);
        const toastId = toast.loading(t("toast.loading"));
        try {
            await api.auth.register({
                full_name: fullName,
                nik,
                email,
                password,
                cf_turnstile_token: turnstileToken,
            });
            toast.success(t("toast.success"), { id: toastId });
            router.push(
                `/check-inbox?email=${encodeURIComponent(formData.email)}&from=register`,
            );
        } catch (err) {
            toast.error(err instanceof Error ? err.message : t("toast.error"), {
                id: toastId,
            });
            turnstileRef.current?.reset();
            setTurnstileToken(null);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className={styles.register}>
            <div className={styles.container}>
                <h1>{t("heading")}</h1>
                <p>{t("requiredHint")}</p>
                <form onSubmit={handleSubmit} noValidate>
                    {register.map((props) => (
                        <RegisterField
                            key={props.name}
                            {...props}
                            value={
                                formData[props.name as keyof typeof formData]
                            }
                            onChange={(e) =>
                                handleChange(props.name, e.target.value)
                            }
                        />
                    ))}
                    <TurnstileWidget
                        ref={turnstileRef}
                        onTokenChange={setTurnstileToken}
                        className={styles.turnstile}
                    />
                    <RegisterAction isLoading={isLoading} />
                </form>
            </div>
        </section>
    );
}
