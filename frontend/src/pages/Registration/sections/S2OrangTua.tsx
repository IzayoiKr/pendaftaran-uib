"use client";

import { useTranslations } from "next-intl";
import {
    PARENT_ADDRESS_FIELD,
    PARENT_SECTIONS,
    PARENT_SELECT_FIELDS,
} from "@/pages/Registration/registerOptions";
import FormField from "@/pages/Registration/shared/FormField";
import PhoneField from "@/pages/Registration/shared/PhoneField";
import SectionCard from "@/pages/Registration/shared/SectionCard";
import SelectField from "@/pages/Registration/shared/SelectField";
import TextField from "@/pages/Registration/shared/TextField";
import type {
    RegistrationFormValues,
    SectionStatus,
} from "@/pages/Registration/types";
import { Controller, useFormContext } from "react-hook-form";
import styles from "@/pages/Registration/Registration.module.scss";

interface S2OrangTuaProps {
    status: SectionStatus;
    collapsed: boolean;
    onToggle: () => void;
    readOnly?: boolean;
}

export default function S2OrangTua({
    status,
    collapsed,
    onToggle,
    readOnly = false,
}: S2OrangTuaProps) {
    const t = useTranslations("registration");
    const to = useTranslations("options");
    const { control } = useFormContext<RegistrationFormValues>();

    return (
        <SectionCard
            id="parent"
            number={2}
            title={t("sections.parent.title")}
            status={status}
            collapsed={collapsed}
            onToggle={onToggle}
        >
            {PARENT_SECTIONS.map((section) => (
                <div key={section.type} className={styles.parentSection}>
                    <h3>{t(section.title)}</h3>
                    <div className={styles.formGrid}>
                        <Controller
                            name={
                                section.fields
                                    .nik as keyof RegistrationFormValues
                            }
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    label={t(section.labels.nik)}
                                    name={section.fields.nik}
                                    value={field.value as string}
                                    onChange={field.onChange}
                                    readOnly={readOnly}
                                />
                            )}
                        />
                        <Controller
                            name={
                                section.fields
                                    .nama as keyof RegistrationFormValues
                            }
                            control={control}
                            render={({ field, fieldState }) => (
                                <TextField
                                    label={t(section.labels.nama)}
                                    name={section.fields.nama}
                                    required
                                    value={field.value as string}
                                    onChange={field.onChange}
                                    error={fieldState.error?.message}
                                    readOnly={readOnly}
                                />
                            )}
                        />
                        <Controller
                            name={
                                section.fields
                                    .tgl as keyof RegistrationFormValues
                            }
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    label={t(section.labels.tgl)}
                                    name={section.fields.tgl}
                                    type="date"
                                    value={field.value as string}
                                    onChange={field.onChange}
                                    readOnly={readOnly}
                                />
                            )}
                        />
                        <Controller
                            name={
                                section.fields
                                    .telp as keyof RegistrationFormValues
                            }
                            control={control}
                            render={({ field, fieldState }) => (
                                <PhoneField
                                    label={t(section.labels.telp)}
                                    name={section.fields.telp}
                                    required
                                    placeholder={t("placeholders.phoneNumber")}
                                    value={field.value as string}
                                    onChange={field.onChange}
                                    error={fieldState.error?.message}
                                    readOnly={readOnly}
                                />
                            )}
                        />
                        {PARENT_SELECT_FIELDS.map(
                            ({ fieldKey, options, placeholder }) => {
                                const fieldName =
                                    section.fields[
                                        fieldKey as keyof typeof section.fields
                                    ];
                                return (
                                    <Controller
                                        key={fieldKey}
                                        name={
                                            fieldName as keyof RegistrationFormValues
                                        }
                                        control={control}
                                        render={({ field }) => (
                                            <SelectField
                                                label={t(
                                                    section.labels[
                                                        fieldKey as keyof typeof section.labels
                                                    ],
                                                )}
                                                name={fieldName}
                                                options={options}
                                                placeholder={to(placeholder)}
                                                value={field.value as string}
                                                onChange={field.onChange}
                                                readOnly={readOnly}
                                            />
                                        )}
                                    />
                                );
                            },
                        )}
                    </div>
                </div>
            ))}

            <Controller
                name={PARENT_ADDRESS_FIELD.name as keyof RegistrationFormValues}
                control={control}
                render={({ field }) => (
                    <FormField label={t(PARENT_ADDRESS_FIELD.label)}>
                        <textarea
                            placeholder={to(PARENT_ADDRESS_FIELD.placeholder)}
                            value={field.value as string}
                            onChange={(e) => field.onChange(e.target.value)}
                            readOnly={readOnly}
                        />
                    </FormField>
                )}
            />
        </SectionCard>
    );
}
