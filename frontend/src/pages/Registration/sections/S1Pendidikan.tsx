"use client";

import { useTranslations } from "next-intl";
import {
    TAHUN_LULUS_SMA_OPTIONS,
    WAKTU_KULIAH_OPTIONS,
} from "@/pages/Registration/registerOptions";
import CardSelect from "@/pages/Registration/shared/CardSelect";
import FormField from "@/pages/Registration/shared/FormField";
import SearchableField from "@/pages/Registration/shared/SearchableField";
import SectionCard from "@/pages/Registration/shared/SectionCard";
import SelectField from "@/pages/Registration/shared/SelectField";
import TextField from "@/pages/Registration/shared/TextField";
import type {
    RegistrationFormValues,
    SectionStatus,
} from "@/pages/Registration/types";
import { Controller, useFormContext } from "react-hook-form";
import styles from "@/pages/Registration/Registration.module.scss";

interface S1PendidikanProps {
    batchType: "Beasiswa" | "Reguler";
    programOptions: Array<{ value: string; label: string }>;
    status: SectionStatus;
    collapsed: boolean;
    onToggle: () => void;
    readOnly?: boolean;
}

export default function S1Pendidikan({
    batchType,
    programOptions,
    status,
    collapsed,
    onToggle,
    readOnly = false,
}: S1PendidikanProps) {
    const t = useTranslations("registration");
    const { control } = useFormContext<RegistrationFormValues>();
    const isBeasiswa = batchType === "Beasiswa";

    return (
        <SectionCard
            id="education"
            number={2}
            title={t("sections.education.title")}
            status={status}
            collapsed={collapsed}
            onToggle={onToggle}
        >
            <Controller
                name="schoolOrigin"
                control={control}
                render={({ field, fieldState }) => (
                    <SearchableField
                        label={t("labels.schoolOrigin")}
                        name="schoolOrigin"
                        required
                        searchEndpoint="/search/school"
                        placeholder={t("placeholders.schoolOrigin")}
                        manualEntryLabel={t("hints.manualSchool")}
                        value={field.value}
                        onChange={field.onChange}
                        error={fieldState.error?.message}
                        readOnly={readOnly}
                    />
                )}
            />

            <div className={styles.formGrid}>
                {isBeasiswa && (
                    <>
                        <Controller
                            name="highschoolGpa"
                            control={control}
                            render={({ field, fieldState }) => (
                                <TextField
                                    label={t("labels.highschoolGpa")}
                                    name="highschoolGpa"
                                    type="number"
                                    step="1.00"
                                    min="0"
                                    max="100"
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
                            name="highschoolGraduateYear"
                            control={control}
                            render={({ field, fieldState }) => (
                                <SelectField
                                    label={t("labels.highschoolGraduateYear")}
                                    name="highschoolGraduateYear"
                                    options={TAHUN_LULUS_SMA_OPTIONS}
                                    required
                                    translateLabels={false}
                                    value={field.value}
                                    onChange={field.onChange}
                                    error={fieldState.error?.message}
                                    readOnly={readOnly}
                                />
                            )}
                        />
                    </>
                )}
                <Controller
                    name="majorChoice"
                    control={control}
                    render={({ field, fieldState }) => (
                        <SelectField
                            label={t("labels.majorChoice")}
                            name="majorChoice"
                            options={programOptions}
                            required
                            translateLabels={false}
                            value={field.value}
                            onChange={field.onChange}
                            error={fieldState.error?.message}
                            readOnly={readOnly}
                        />
                    )}
                />
            </div>

            <Controller
                name="waktuKuliah"
                control={control}
                render={({ field, fieldState }) => (
                    <FormField
                        label={t("labels.classSchedule")}
                        required
                        error={fieldState.error?.message}
                    >
                        <CardSelect
                            options={WAKTU_KULIAH_OPTIONS}
                            value={field.value}
                            onChange={field.onChange}
                            readOnly={readOnly}
                        />
                    </FormField>
                )}
            />
        </SectionCard>
    );
}
