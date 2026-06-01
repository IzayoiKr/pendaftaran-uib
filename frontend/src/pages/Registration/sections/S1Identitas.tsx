"use client";

import { useTranslations } from "next-intl";
import {
    JENIS_DAFTAR_OPTIONS,
    JENIS_KELAMIN_OPTIONS,
    JENJANG_PENDIDIKAN_OPTIONS,
    KEWARGANEGARAAN_OPTIONS,
} from "@/pages/Registration/registerOptions";
import CardSelect from "@/pages/Registration/shared/CardSelect";
import DisplayField from "@/pages/Registration/shared/DisplayField";
import FormField from "@/pages/Registration/shared/FormField";
import PhoneField from "@/pages/Registration/shared/PhoneField";
import SearchableField from "@/pages/Registration/shared/SearchableField";
import SectionCard from "@/pages/Registration/shared/SectionCard";
import SelectField from "@/pages/Registration/shared/SelectField";
import TextField from "@/pages/Registration/shared/TextField";
import type {
    RegistrationFormValues,
    SectionStatus,
} from "@/pages/Registration/types";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import styles from "@/pages/Registration/Registration.module.scss";

interface S1IdentitasProps {
    user: { full_name: string; email: string } | null;
    unmaskedNik: string;
    status: SectionStatus;
    collapsed: boolean;
    onToggle: () => void;
    readOnly?: boolean;
}

export default function S1Identitas({
    user,
    unmaskedNik,
    status,
    collapsed,
    onToggle,
    readOnly = false,
}: S1IdentitasProps) {
    const t = useTranslations("registration");
    const { control } = useFormContext<RegistrationFormValues>();
    const jenisdaftar = useWatch({ control, name: "jenisdaftar" });
    const isTransferOrAlih =
        jenisdaftar === "TRANSFER" || jenisdaftar === "ALIH_JENJANG";

    return (
        <SectionCard
            id="identity"
            number={1}
            title={t("sections.identity.title")}
            status={status}
            collapsed={collapsed}
            onToggle={onToggle}
        >
            <div className={styles.formGrid}>
                <DisplayField
                    label={t("labels.fullName")}
                    value={user?.full_name ?? ""}
                />
                <DisplayField
                    label={t("labels.email")}
                    value={user?.email ?? ""}
                />
                <DisplayField
                    label={t("labels.nik")}
                    value={unmaskedNik || "-"}
                />
            </div>

            <div className={styles.formGrid}>
                <Controller
                    name="gender"
                    control={control}
                    render={({ field, fieldState }) => (
                        <SelectField
                            label={t("labels.gender")}
                            name="gender"
                            options={JENIS_KELAMIN_OPTIONS}
                            required
                            value={field.value}
                            onChange={field.onChange}
                            error={fieldState.error?.message}
                            readOnly={readOnly}
                        />
                    )}
                />
                <Controller
                    name="citizenship"
                    control={control}
                    render={({ field, fieldState }) => (
                        <SelectField
                            label={t("labels.nationality")}
                            name="citizenship"
                            options={KEWARGANEGARAAN_OPTIONS}
                            required
                            value={field.value}
                            onChange={field.onChange}
                            error={fieldState.error?.message}
                            readOnly={readOnly}
                        />
                    )}
                />
                <Controller
                    name="birthPlace"
                    control={control}
                    render={({ field, fieldState }) => (
                        <TextField
                            label={t("labels.birthPlace")}
                            name="birthPlace"
                            required
                            placeholder={t("placeholders.birthPlace")}
                            value={field.value}
                            onChange={field.onChange}
                            error={fieldState.error?.message}
                            readOnly={readOnly}
                        />
                    )}
                />
                <Controller
                    name="birthDate"
                    control={control}
                    render={({ field, fieldState }) => (
                        <TextField
                            label={t("labels.birthDate")}
                            name="birthDate"
                            type="date"
                            required
                            value={field.value}
                            onChange={field.onChange}
                            error={fieldState.error?.message}
                            readOnly={readOnly}
                        />
                    )}
                />
                <Controller
                    name="phoneNumber"
                    control={control}
                    render={({ field, fieldState }) => (
                        <PhoneField
                            label={t("labels.phoneNumber")}
                            name="phoneNumber"
                            required
                            placeholder={t("placeholders.phoneNumber")}
                            value={field.value}
                            onChange={field.onChange}
                            error={fieldState.error?.message}
                            readOnly={readOnly}
                        />
                    )}
                />
                <Controller
                    name="whatsappNumber"
                    control={control}
                    render={({ field, fieldState }) => (
                        <PhoneField
                            label={t("labels.whatsappNumber")}
                            name="whatsappNumber"
                            required
                            placeholder={t("placeholders.whatsappNumber")}
                            value={field.value}
                            onChange={field.onChange}
                            error={fieldState.error?.message}
                            readOnly={readOnly}
                        />
                    )}
                />
            </div>

            <Controller
                name="jenisdaftar"
                control={control}
                render={({ field, fieldState }) => (
                    <FormField
                        label={t("labels.registrationType")}
                        required
                        error={fieldState.error?.message}
                    >
                        <CardSelect
                            options={JENIS_DAFTAR_OPTIONS}
                            value={field.value}
                            onChange={field.onChange}
                            readOnly={readOnly}
                        />
                    </FormField>
                )}
            />

            {isTransferOrAlih && (
                <div className={`${styles.formGrid} ${styles.reveal}`}>
                    <Controller
                        name="previousUniversity"
                        control={control}
                        render={({ field, fieldState }) => (
                            <SearchableField
                                label={t("labels.previousUniversity")}
                                name="previousUniversity"
                                required
                                searchEndpoint="/search/university"
                                placeholder={t(
                                    "placeholders.previousUniversity",
                                )}
                                manualEntryLabel={t("hints.manualUniversity")}
                                value={field.value}
                                onChange={field.onChange}
                                error={fieldState.error?.message}
                                readOnly={readOnly}
                            />
                        )}
                    />
                    <Controller
                        name="previousMajor"
                        control={control}
                        render={({ field, fieldState }) => (
                            <TextField
                                label={t("labels.previousMajor")}
                                name="previousMajor"
                                required
                                value={field.value}
                                onChange={field.onChange}
                                error={fieldState.error?.message}
                                readOnly={readOnly}
                            />
                        )}
                    />
                    <Controller
                        name="gpa"
                        control={control}
                        render={({ field, fieldState }) => (
                            <TextField
                                label={`${t("labels.gpa")} ${t("hints.gpaRange")}`}
                                name="gpa"
                                type="number"
                                step="0.01"
                                min="0"
                                max="4"
                                required
                                restriction="decimal"
                                value={field.value}
                                onChange={field.onChange}
                                error={fieldState.error?.message}
                                readOnly={readOnly}
                            />
                        )}
                    />
                    <Controller
                        name="highestEducation"
                        control={control}
                        render={({ field, fieldState }) => (
                            <SelectField
                                label={t("labels.highestEducation")}
                                name="highestEducation"
                                options={JENJANG_PENDIDIKAN_OPTIONS}
                                required
                                value={field.value}
                                onChange={field.onChange}
                                error={fieldState.error?.message}
                                readOnly={readOnly}
                            />
                        )}
                    />
                </div>
            )}
        </SectionCard>
    );
}
