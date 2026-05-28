"use client";

import { useTranslations } from "next-intl";
import {
    AGAMA_OPTIONS,
    KEWARGANEGARAAN_OPTIONS,
    STATUS_INSTANSI_OPTIONS,
    SUMBER_BIAYA_OPTIONS,
    TAHUN_MULAI_KERJA_OPTIONS,
} from "@/pages/Registration/registerOptions";
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
import { Controller, useFormContext } from "react-hook-form";
import styles from "@/pages/Registration/Registration.module.scss";

interface S2BiodataProps {
    user: { full_name: string; email: string } | null;
    unmaskedNik: string;
    programOptions: Array<{ value: string; label: string }>;
    status: SectionStatus;
    collapsed: boolean;
    onToggle: () => void;
}

export default function S2Biodata({
    user,
    unmaskedNik,
    programOptions,
    status,
    collapsed,
    onToggle,
}: S2BiodataProps) {
    const t = useTranslations("registration");
    const { control } = useFormContext<RegistrationFormValues>();

    return (
        <SectionCard
            id="biodata"
            number={1}
            title={t("sections.biodata.title")}
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
                        />
                    )}
                />
                <Controller
                    name="contactEmail"
                    control={control}
                    render={({ field, fieldState }) => (
                        <TextField
                            label={t("labels.contactEmail")}
                            name="contactEmail"
                            type="email"
                            required
                            placeholder={t("placeholders.contactEmail")}
                            value={field.value}
                            onChange={field.onChange}
                            error={fieldState.error?.message}
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
                        />
                    )}
                />
                <Controller
                    name="religion"
                    control={control}
                    render={({ field, fieldState }) => (
                        <SelectField
                            label={t("labels.religion")}
                            name="religion"
                            options={AGAMA_OPTIONS}
                            required
                            value={field.value}
                            onChange={field.onChange}
                            error={fieldState.error?.message}
                        />
                    )}
                />
                <Controller
                    name="fundingSource"
                    control={control}
                    render={({ field, fieldState }) => (
                        <SelectField
                            label={t("labels.fundingSource")}
                            name="fundingSource"
                            options={SUMBER_BIAYA_OPTIONS}
                            required
                            value={field.value}
                            onChange={field.onChange}
                            error={fieldState.error?.message}
                        />
                    )}
                />
            </div>

            <div className={styles.formGrid}>
                <Controller
                    name="taxID"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            label={`${t("labels.taxID")} — ${t("hints.optional")}`}
                            name="taxID"
                            placeholder={t("placeholders.taxID")}
                            value={field.value}
                            onChange={field.onChange}
                        />
                    )}
                />
                <Controller
                    name="reference"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            label={`${t("labels.reference")} — ${t("hints.optional")}`}
                            name="reference"
                            placeholder={t("placeholders.reference")}
                            value={field.value}
                            onChange={field.onChange}
                        />
                    )}
                />
                <Controller
                    name="expertField"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            label={`${t("labels.expertField")} — ${t("hints.optional")}`}
                            name="expertField"
                            placeholder={t("placeholders.expertField")}
                            value={field.value}
                            onChange={field.onChange}
                        />
                    )}
                />
            </div>

            <h3 className={styles.subsectionTitle}>{t("labels.address")}</h3>
            <div className={styles.formGrid}>
                <Controller
                    name="address"
                    control={control}
                    render={({ field, fieldState }) => (
                        <FormField
                            label={t("labels.address")}
                            required
                            error={fieldState.error?.message}
                        >
                            <textarea
                                placeholder={t("placeholders.address")}
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value)}
                            />
                        </FormField>
                    )}
                />
                <Controller
                    name="subDistrict"
                    control={control}
                    render={({ field, fieldState }) => (
                        <TextField
                            label={t("labels.subDistrict")}
                            name="subDistrict"
                            required
                            value={field.value}
                            onChange={field.onChange}
                            error={fieldState.error?.message}
                        />
                    )}
                />
                <Controller
                    name="district"
                    control={control}
                    render={({ field, fieldState }) => (
                        <TextField
                            label={t("labels.district")}
                            name="district"
                            required
                            value={field.value}
                            onChange={field.onChange}
                            error={fieldState.error?.message}
                        />
                    )}
                />
                <Controller
                    name="hamlet"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            label={`${t("labels.hamlet")} — ${t("hints.optional")}`}
                            name="hamlet"
                            value={field.value}
                            onChange={field.onChange}
                        />
                    )}
                />
                <Controller
                    name="postalCode"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            label={`${t("labels.postalCode")} — ${t("hints.optional")}`}
                            name="postalCode"
                            placeholder={t("placeholders.postalCode")}
                            value={field.value}
                            onChange={field.onChange}
                        />
                    )}
                />
                <Controller
                    name="rt"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            label={`RT — ${t("hints.optional")}`}
                            name="rt"
                            value={field.value}
                            onChange={field.onChange}
                        />
                    )}
                />
                <Controller
                    name="rw"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            label={`RW — ${t("hints.optional")}`}
                            name="rw"
                            value={field.value}
                            onChange={field.onChange}
                        />
                    )}
                />
            </div>

            <h3 className={styles.subsectionTitle}>
                {t("labels.previousUniversity")}
            </h3>
            <div className={styles.formGrid}>
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
                            restriction="decimal"
                            required
                            value={field.value}
                            onChange={field.onChange}
                            error={fieldState.error?.message}
                        />
                    )}
                />
                <Controller
                    name="degree"
                    control={control}
                    render={({ field, fieldState }) => (
                        <TextField
                            label={t("labels.degree")}
                            name="degree"
                            required
                            placeholder={t("placeholders.degree")}
                            value={field.value}
                            onChange={field.onChange}
                            error={fieldState.error?.message}
                        />
                    )}
                />
                <Controller
                    name="previousUniversity"
                    control={control}
                    render={({ field, fieldState }) => (
                        <SearchableField
                            label={t("labels.previousUniversity")}
                            name="previousUniversity"
                            required
                            searchEndpoint="/search/university"
                            placeholder={t("placeholders.previousUniversity")}
                            manualEntryLabel={t("hints.manualUniversity")}
                            value={field.value}
                            onChange={field.onChange}
                            error={fieldState.error?.message}
                        />
                    )}
                />
            </div>

            <h3 className={styles.subsectionTitle}>
                {`${t("labels.companyName")} — ${t("hints.optional")}`}
            </h3>
            <div className={styles.formGrid}>
                <Controller
                    name="companyName"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            label={`${t("labels.companyName")} — ${t("hints.optional")}`}
                            name="companyName"
                            placeholder={t("placeholders.companyName")}
                            value={field.value}
                            onChange={field.onChange}
                        />
                    )}
                />
                <Controller
                    name="companyAddress"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            label={`${t("labels.companyAddress")} — ${t("hints.optional")}`}
                            name="companyAddress"
                            placeholder={t("placeholders.companyAddress")}
                            value={field.value}
                            onChange={field.onChange}
                        />
                    )}
                />
                <Controller
                    name="position"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            label={`${t("labels.position")} — ${t("hints.optional")}`}
                            name="position"
                            placeholder={t("placeholders.position")}
                            value={field.value}
                            onChange={field.onChange}
                        />
                    )}
                />
                <Controller
                    name="companyStatus"
                    control={control}
                    render={({ field }) => (
                        <SelectField
                            label={`${t("labels.companyStatus")} — ${t("hints.optional")}`}
                            name="companyStatus"
                            options={STATUS_INSTANSI_OPTIONS}
                            value={field.value}
                            onChange={field.onChange}
                        />
                    )}
                />
                <Controller
                    name="companyStartYear"
                    control={control}
                    render={({ field }) => (
                        <SelectField
                            label={`${t("labels.companyStartYear")} — ${t("hints.optional")}`}
                            name="companyStartYear"
                            options={TAHUN_MULAI_KERJA_OPTIONS}
                            translateLabels={false}
                            value={field.value}
                            onChange={field.onChange}
                        />
                    )}
                />
            </div>

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
                    />
                )}
            />
        </SectionCard>
    );
}
