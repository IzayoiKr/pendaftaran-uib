"use client";

import { useTranslations } from "next-intl";
import SectionCard from "@/pages/Registration/shared/SectionCard";
import TextField from "@/pages/Registration/shared/TextField";
import UploadZone from "@/pages/Registration/shared/UploadZone";
import type {
    PaymentConfig,
    RegistrationFormValues,
    SectionStatus,
} from "@/pages/Registration/types";
import { Controller, useFormContext } from "react-hook-form";
import { FileIcon } from "@/components/Icons/Icons";
import styles from "@/pages/Registration/Registration.module.scss";

interface PembayaranProps {
    paymentConfig: PaymentConfig;
    status: SectionStatus;
    collapsed: boolean;
    onToggle: () => void;
}

export default function Pembayaran({
    paymentConfig,
    status,
    collapsed,
    onToggle,
}: PembayaranProps) {
    const t = useTranslations("registration");
    const { control } = useFormContext<RegistrationFormValues>();
    const config = paymentConfig;

    return (
        <SectionCard
            id="payment"
            number={4}
            title={t("sections.payment.title")}
            status={status}
            collapsed={collapsed}
            onToggle={onToggle}
        >
            <div className={styles.paymentInfoCard}>
                <h3>{t("payment.infoTitle")}</h3>
                <p>
                    <strong>{t("payment.feeLabel")}:</strong>{" "}
                    <span>{config.biayaDisplay}</span>
                </p>
                <p>
                    <strong>{t("payment.bankLabel")}:</strong>{" "}
                    <span>{config.bank}</span>
                </p>
                <p>
                    <strong>{t("payment.accountNumberLabel")}:</strong>{" "}
                    <span>{config.rekening}</span>
                </p>
                <p>
                    <strong>{t("payment.accountHolderLabel")}:</strong>{" "}
                    <span>{config.atasNama}</span>
                </p>
                <a
                    href={config.qrisPath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.qrisLink}
                >
                    <FileIcon /> {t("payment.qrisGuide")}
                </a>
            </div>

            <div className={styles.formGrid}>
                <Controller
                    name="accountHolder"
                    control={control}
                    render={({ field, fieldState }) => (
                        <TextField
                            label={t("labels.accountHolder")}
                            name="accountHolder"
                            required
                            placeholder={t("placeholders.accountHolder")}
                            value={field.value}
                            onChange={field.onChange}
                            error={fieldState.error?.message}
                        />
                    )}
                />
                <Controller
                    name="bank"
                    control={control}
                    render={({ field, fieldState }) => (
                        <TextField
                            label={t("labels.bank")}
                            name="bank"
                            required
                            placeholder={t("placeholders.bank")}
                            value={field.value}
                            onChange={field.onChange}
                            error={fieldState.error?.message}
                        />
                    )}
                />
            </div>

            <Controller
                name="paymentProof"
                control={control}
                render={({ field, fieldState }) => (
                    <UploadZone
                        label={t("labels.paymentProof")}
                        name="paymentProof"
                        required
                        file={field.value}
                        onFileChange={field.onChange}
                        error={fieldState.error?.message}
                    />
                )}
            />
        </SectionCard>
    );
}
