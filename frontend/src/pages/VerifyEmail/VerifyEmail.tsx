"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ApiError, api } from "@/api";
import ExpiredLink from "@/components/ExpiredLink/ExpiredLink";
import {
    BouncingBallsIcon,
    CheckmarkIcon,
} from "@/components/Icons/AnimatedIcons";
import TurnstileWidget from "@/components/TurnstileWidget";
import type { TurnstileHandle } from "@/components/TurnstileWidget";
import styles from "./VerifyEmail.module.scss";

type State = "pending" | "loading" | "success" | "expired";

export default function VerifyEmail() {
    const t = useTranslations("verifyEmail");
    const searchParams = useSearchParams();
    const token = searchParams?.get("token");

    const [state, setState] = useState<State>("pending");
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
    const turnstileRef = useRef<TurnstileHandle>(null);

    if (!token) {
        return (
            <main className={styles.verifyEmail}>
                <ExpiredLink type="verify-email" />
            </main>
        );
    }

    const handleVerify = async () => {
        if (!turnstileToken) return;

        setState("loading");
        const toastId = toast.loading(t("toast.loading"));
        try {
            await api.auth.verifyEmail(token, turnstileToken);
            setState("success");
            toast.dismiss(toastId);
        } catch (err) {
            turnstileRef.current?.reset();
            setTurnstileToken(null);

            const isExpired = err instanceof ApiError && err.expired;
            if (isExpired) {
                setState("expired");
                toast.warning(t("toast.invalidLink"), { id: toastId });
            } else {
                setState("pending");
                toast.error(
                    err instanceof Error ? err.message : t("toast.error"),
                    { id: toastId },
                );
            }
        }
    };

    if (state === "expired") {
        return (
            <main className={styles.verifyEmail}>
                <ExpiredLink type="verify-email" />
            </main>
        );
    }

    if (state === "success") {
        return (
            <main className={styles.verifyEmail}>
                <div className={styles.container}>
                    <CheckmarkIcon />
                    <h1 className={styles.heading}>{t("headingSuccess")}</h1>
                    <p className={styles.body}>{t("bodySuccess")}</p>
                    <Link href="/login" className={styles.btn}>
                        {t("buttonSuccess")}
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className={styles.verifyEmail}>
            <div className={styles.container}>
                <BouncingBallsIcon />

                <h1 className={styles.heading}>{t("headingPending")}</h1>
                <p className={styles.body}>{t("bodyPending")}</p>

                <TurnstileWidget
                    ref={turnstileRef}
                    onTokenChange={setTurnstileToken}
                    className={styles.turnstile}
                />

                <button
                    onClick={handleVerify}
                    disabled={!turnstileToken || state === "loading"}
                    className={styles.btn}
                    aria-busy={state === "loading"}
                >
                    {state === "loading"
                        ? t("buttonLoading")
                        : t("buttonDefault")}
                </button>
            </div>
        </main>
    );
}
