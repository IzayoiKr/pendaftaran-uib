"use client";

import { useTranslations } from "next-intl";
import {
    S1_BEASISWA_DOCS,
    S1_DOCS,
    S2_DOCS,
} from "@/views/Registration/registerOptions";
import SectionCard from "@/views/Registration/shared/SectionCard";
import UploadZone from "@/views/Registration/shared/UploadZone";
import type {
    DocumentField,
    RegistrationFormValues,
    SectionStatus,
} from "@/views/Registration/types";
import { JENIS_DAFTAR } from "@/views/Registration/valueOptions";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import styles from "@/views/Registration/Registration.module.scss";

interface DokumenProps {
    level: "S1" | "S2";
    batchType: "Beasiswa" | "Reguler";
    status: SectionStatus;
    collapsed: boolean;
    onToggle: () => void;
    readOnly?: boolean;
}

export default function Dokumen({
    level,
    batchType,
    status,
    collapsed,
    onToggle,
    readOnly = false,
}: DokumenProps) {
    const t = useTranslations("registration");
    const to = useTranslations("options");
    const { control } = useFormContext<RegistrationFormValues>();

    const jenisdaftar = useWatch({ control, name: "jenisdaftar" });

    const isTransferOrAlih =
        jenisdaftar === JENIS_DAFTAR.TRANSFER ||
        jenisdaftar === JENIS_DAFTAR.ALIH_JENJANG;
    const isBeasiswa = level === "S1" && batchType === "Beasiswa";

    const baseDocs = level === "S1" ? S1_DOCS : S2_DOCS;
    const visibleDocs = baseDocs.filter((doc) =>
        doc.condition === "transferOrAlih" ? isTransferOrAlih : true,
    );

    return (
        <SectionCard
            id="document"
            number={3}
            title={t("sections.document.title")}
            status={status}
            collapsed={collapsed}
            onToggle={onToggle}
        >
            <p className={styles.hint}>{t("hints.uploadFormat")}</p>
            <div className={styles.formGrid}>
                {visibleDocs.map((doc) => (
                    <Controller
                        key={doc.name}
                        name={doc.name as keyof RegistrationFormValues}
                        control={control}
                        render={({ field, fieldState }) => (
                            <UploadZone
                                name={doc.name}
                                label={to(doc.label)}
                                required={doc.required}
                                file={field.value as DocumentField}
                                onFileChange={field.onChange}
                                error={fieldState.error?.message}
                                readOnly={readOnly}
                            />
                        )}
                    />
                ))}
                {isBeasiswa &&
                    S1_BEASISWA_DOCS.map((doc) => (
                        <Controller
                            key={doc.name}
                            name={doc.name as keyof RegistrationFormValues}
                            control={control}
                            render={({ field, fieldState }) => (
                                <UploadZone
                                    name={doc.name}
                                    label={to(doc.label)}
                                    required={doc.required}
                                    file={field.value as DocumentField}
                                    onFileChange={field.onChange}
                                    error={fieldState.error?.message}
                                    readOnly={readOnly}
                                />
                            )}
                        />
                    ))}
            </div>
        </SectionCard>
    );
}
