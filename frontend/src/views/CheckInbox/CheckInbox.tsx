"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api } from "@/api";
import { MailEnvelopeIcon } from "@/components/Icons/Icons";
import styles from "./CheckInbox.module.scss";

export default function CheckInbox() {
    const t = useTranslations("checkInbox");
    const searchParams = useSearchParams();
    const email = searchParams?.get("email") ?? "";
    const from = searchParams?.get("from");
    const didAutoResend = useRef(false);

    const [resendStatus, setResendStatus] = useState<
        "idle" | "loading" | "sent"
    >(() => {
        if (from === "resend") return "sent";
        if (from === "login" && email) return "loading";
        return "idle";
    });

    useEffect(() => {
        if (from !== "login" || !email) return;
        if (didAutoResend.current) return;

        didAutoResend.current = true;
        api.auth
            .resendVerification(email)
            .then(() => setResendStatus("sent"))
            .catch(() => setResendStatus("idle"));
    }, [email, from]);

    const handleManualResend = async () => {
        if (!email || resendStatus === "loading") return;
        setResendStatus("loading");
        try {
            await api.auth.resendVerification(email);
            setResendStatus("sent");
        } catch {
            setResendStatus("idle");
        }
    };

    return (
        <main className={styles.checkInbox}>
            <div className={styles.container}>
                <MailEnvelopeIcon />

                <h1 className={styles.heading}>{t("heading")}</h1>

                <p className={styles.body}>
                    {email
                        ? t("bodyWithEmail", { email })
                        : t("bodyWithoutEmail")}
                </p>

                {resendStatus === "sent" && (
                    <p className={styles.sentMsg}>{t("sentConfirmation")}</p>
                )}

                {resendStatus !== "sent" && (
                    <>
                        <button
                            onClick={handleManualResend}
                            disabled={resendStatus === "loading" || !email}
                            className={styles.resendBtn}
                        >
                            {t("resendButton")}
                        </button>
                        <p className={styles.resendNote}>{t("resendNote")}</p>
                    </>
                )}

                <Link href="/login" className={styles.loginLink}>
                    {t("backToLogin")}
                </Link>
            </div>
        </main>
    );
}
