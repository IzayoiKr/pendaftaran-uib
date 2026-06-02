"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useRevealNik } from "@/hooks/UseRevealNIK";
import scrollToId from "@/utils/ScrollToId";
import { Controller, FormProvider, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import useAuthStore from "@/store/useAuthStore";
import { s1SubmitSchema } from "@/validation/registration/s1";
import { s2SubmitSchema } from "@/validation/registration/s2";
import { SendIcon } from "@/components/Icons/Icons";
import RegistrationSkeleton from "./Registration.skeleton";
import Sidebar from "./Sidebar";
import { S1_BEASISWA_DOCS, S1_DOCS, S2_DOCS } from "./registerOptions";
import Dokumen from "./sections/Dokumen";
import Pembayaran from "./sections/Pembayaran";
import S1Identitas from "./sections/S1Identitas";
import S1Pendidikan from "./sections/S1Pendidikan";
import S2Biodata from "./sections/S2Biodata";
import S2OrangTua from "./sections/S2OrangTua";
import type {
    DocumentField,
    RegistrationFormProps,
    RegistrationFormValues,
    SectionStatus,
} from "./types";
import { REGISTRATION_DEFAULT_VALUES, hasDocument } from "./types";
import { useRegistrationStatus } from "./useRegistrationStatus";
import { useRegistrationSubmit } from "./useRegistrationSubmit";
import styles from "./Registration.module.scss";

const MemoS1Identitas = memo(S1Identitas);
const MemoS1Pendidikan = memo(S1Pendidikan);
const MemoS2Biodata = memo(S2Biodata);
const MemoS2OrangTua = memo(S2OrangTua);
const MemoDokumen = memo(Dokumen);
const MemoPembayaran = memo(Pembayaran);

function BaruDeclarationCheckbox({
    checked,
    onChange,
    label,
}: {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: string;
}) {
    return (
        <label className={styles.checkboxLabel}>
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
            />
            {label}
        </label>
    );
}

function collapseAllExcept(
    prev: Record<string, boolean>,
    id: string,
): Record<string, boolean> {
    return Object.fromEntries(Object.keys(prev).map((k) => [k, k !== id]));
}

function isTransferOrAlih(val: string | null | undefined): boolean {
    return val === "TRANSFER" || val === "ALIH_JENJANG";
}

function toStatus(filled: number, total: number): SectionStatus {
    if (total === 0 || filled === 0) return "empty";
    if (filled >= total) return "complete";
    return "partial";
}

function str(
    values: Partial<RegistrationFormValues>,
    key: keyof RegistrationFormValues,
): boolean {
    const v = values[key];
    if (v === null || v === undefined) return false;
    if (typeof v === "boolean") return v;
    if (typeof v === "string") return v.trim() !== "";
    if (v instanceof File) return true;
    return false;
}

function hasFile(
    values: Partial<RegistrationFormValues>,
    key: keyof RegistrationFormValues,
): boolean {
    const v = values[key] as DocumentField;
    return hasDocument(v);
}

function getErrorSectionId(field: string, level: "S1" | "S2"): string {
    const s1Map: Record<string, string> = {
        jenisdaftar: "identity",
        gender: "identity",
        citizenship: "identity",
        birthPlace: "identity",
        birthDate: "identity",
        phoneNumber: "identity",
        whatsappNumber: "identity",
        previousUniversity: "identity",
        previousMajor: "identity",
        gpa: "identity",
        highestEducation: "identity",
        schoolOrigin: "education",
        highschoolGpa: "education",
        highschoolGraduateYear: "education",
        majorChoice: "education",
        waktuKuliah: "education",
    };

    const s2Map: Record<string, string> = {
        citizenship: "biodata",
        birthPlace: "biodata",
        birthDate: "biodata",
        contactEmail: "biodata",
        phoneNumber: "biodata",
        religion: "biodata",
        fundingSource: "biodata",
        taxID: "biodata",
        reference: "biodata",
        expertField: "biodata",
        address: "biodata",
        subDistrict: "biodata",
        district: "biodata",
        hamlet: "biodata",
        postalCode: "biodata",
        rt: "biodata",
        rw: "biodata",
        previousMajor: "biodata",
        gpa: "biodata",
        degree: "biodata",
        previousUniversity: "biodata",
        companyName: "biodata",
        companyAddress: "biodata",
        position: "biodata",
        companyStatus: "biodata",
        companyStartYear: "biodata",
        majorChoice: "biodata",
        fatherNik: "parent",
        fatherName: "parent",
        fatherBirthdate: "parent",
        fatherPhone: "parent",
        fatherEducation: "parent",
        fatherOccupation: "parent",
        fatherIncome: "parent",
        fatherStatus: "parent",
        motherNik: "parent",
        motherName: "parent",
        motherBirthdate: "parent",
        motherPhone: "parent",
        motherEducation: "parent",
        motherOccupation: "parent",
        motherIncome: "parent",
        motherStatus: "parent",
        parentsAddress: "parent",
    };

    const sharedMap: Record<string, string> = {
        pp: "document",
        ktp: "document",
        kk: "document",
        transkripNilai: "document",
        ijazahDok: "document",
        sktmKip: "document",
        fotoRumah: "document",
        tagihanListrik: "document",
        tagihanAir: "document",
        sertifikatPrestasi: "document",
        rapot1: "document",
        rapot2: "document",
        rapot3: "document",
        rapot4: "document",
        al: "document",
        r1: "document",
        r2: "document",
        accountHolder: "payment",
        bank: "payment",
        paymentProof: "payment",
        confirmation: "declarations",
        pernyataan: "declarations",
    };

    if (level === "S1" && field in s1Map) return s1Map[field];
    if (level === "S2" && field in s2Map) return s2Map[field];
    return sharedMap[field] || "document";
}

function computeSectionStatuses(
    values: Partial<RegistrationFormValues>,
    level: "S1" | "S2",
    batchType: "Beasiswa" | "Reguler",
): Record<string, SectionStatus> {
    const isBeasiswa = batchType === "Beasiswa";
    const isTransferAlih = isTransferOrAlih(values.jenisdaftar);

    const identityBase = [
        "gender",
        "citizenship",
        "birthPlace",
        "birthDate",
        "phoneNumber",
        "whatsappNumber",
    ] as const;
    const identityExtra = [
        "previousUniversity",
        "previousMajor",
        "gpa",
        "highestEducation",
    ] as const;
    const identityFields = isTransferAlih
        ? [...identityBase, ...identityExtra]
        : [...identityBase];
    const identityFilled =
        identityFields.filter((f) => str(values, f)).length +
        (values.jenisdaftar ? 1 : 0);

    const eduBase = ["schoolOrigin", "majorChoice"] as const;
    const eduExtra = ["highschoolGpa", "highschoolGraduateYear"] as const;
    const eduFields = isBeasiswa ? [...eduBase, ...eduExtra] : [...eduBase];
    const eduFilled =
        eduFields.filter((f) => str(values, f)).length +
        (values.waktuKuliah ? 1 : 0);

    const bioFields = [
        "citizenship",
        "birthPlace",
        "birthDate",
        "contactEmail",
        "phoneNumber",
        "religion",
        "fundingSource",
        "address",
        "subDistrict",
        "district",
        "previousMajor",
        "gpa",
        "degree",
        "previousUniversity",
        "majorChoice",
    ] as const;
    const bioFilled = bioFields.filter((f) => str(values, f)).length;

    const parentFields = [
        "fatherName",
        "fatherPhone",
        "motherName",
        "motherPhone",
    ] as const;
    const parentFilled = parentFields.filter((f) => str(values, f)).length;

    const baseDocs = level === "S1" ? S1_DOCS : S2_DOCS;
    const visibleDocs = baseDocs.filter((doc) =>
        doc.condition === "transferOrAlih" ? isTransferAlih : true,
    );
    const allDocs =
        level === "S1" && isBeasiswa
            ? [...visibleDocs, ...S1_BEASISWA_DOCS]
            : visibleDocs;
    const requiredDocs = allDocs.filter((d) => d.required);
    const docFilled = requiredDocs.filter((d) =>
        hasFile(values, d.name as keyof RegistrationFormValues),
    ).length;

    const payFilled =
        (["accountHolder", "bank"] as const).filter((f) => str(values, f))
            .length + (hasFile(values, "paymentProof") ? 1 : 0);

    return {
        identity: toStatus(identityFilled, identityFields.length + 1),
        education: toStatus(eduFilled, eduFields.length + 1),
        biodata: toStatus(bioFilled, bioFields.length),
        parent: toStatus(parentFilled, parentFields.length),
        document: toStatus(docFilled, requiredDocs.length),
        payment: toStatus(payFilled, 3),
    };
}

export default function RegistrationForm({
    degree: level,
    event,
    programOptions,
    paymentConfig,
    readOnly = false,
}: RegistrationFormProps) {
    const params = useParams();
    const batchKey = params?.batchKey as string;

    const {
        status,
        draftData,
        isLoading: statusLoading,
        isViewMode,
    } = useRegistrationStatus(batchKey);

    const isReadOnly = readOnly || isViewMode;

    const t = useTranslations("registration");
    const tv = useTranslations("validation");

    const router = useRouter();
    const { user } = useAuthStore();
    const { data: nikData } = useRevealNik();
    const unmaskedNik = nikData?.nik ?? "";
    const [isSubmitting, setIsSubmitting] = useState(false);

    const methods = useForm<RegistrationFormValues>({
        defaultValues: REGISTRATION_DEFAULT_VALUES,
        mode: "onTouched",
    });
    const { control, handleSubmit, setError, clearErrors, reset, getValues } =
        methods;

    const { submit } = useRegistrationSubmit(batchKey, getValues);

    useEffect(() => {
        if (
            draftData &&
            (status === "DRAFT" ||
                status === "REJECTED" ||
                status == "SUBMITTED")
        ) {
            reset({
                ...REGISTRATION_DEFAULT_VALUES,
                ...draftData,
            });
        }
    }, [draftData, status, reset]);

    const [collapsed, setCollapsed] = useState<Record<string, boolean>>({
        identity: true,
        education: true,
        biodata: true,
        parent: true,
        document: true,
        payment: true,
    });

    const formValues = useWatch({ control });

    const sectionStatuses = useMemo<Record<string, SectionStatus>>(
        () => computeSectionStatuses(formValues, level, event.batchType),
        [formValues, level, event.batchType],
    );

    const toggleSection = useCallback((id: string) => {
        setCollapsed((prev) => {
            if (prev[id]) {
                requestAnimationFrame(() =>
                    requestAnimationFrame(() => scrollToId(id)),
                );
                return collapseAllExcept(prev, id);
            }
            return { ...prev, [id]: true };
        });
    }, []);

    const expandAndScroll = useCallback((id: string) => {
        setCollapsed((prev) => collapseAllExcept(prev, id));
        requestAnimationFrame(() =>
            requestAnimationFrame(() => scrollToId(id)),
        );
    }, []);

    const onSubmit = async (data: RegistrationFormValues) => {
        if (isReadOnly) return;
        setIsSubmitting(true);
        const toastId = toast.loading("Submitting...");
        try {
            const result =
                level === "S1"
                    ? s1SubmitSchema(tv).safeParse(data)
                    : s2SubmitSchema(tv).safeParse(data);

            if (!result.success) {
                clearErrors();
                result.error.issues.forEach((issue) => {
                    const field = issue.path[0] as keyof RegistrationFormValues;
                    setError(field, { type: "manual", message: issue.message });
                });

                const firstError = result.error.issues[0];
                if (firstError) {
                    const fieldName = firstError.path[0] as string;
                    const sectionId = getErrorSectionId(fieldName, level);
                    setCollapsed((prev) => collapseAllExcept(prev, sectionId));
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            scrollToId(sectionId);
                            setTimeout(() => {
                                const el = document.querySelector<HTMLElement>(
                                    `#${sectionId} input[name="${fieldName}"],
                                     #${sectionId} select[name="${fieldName}"],
                                     #${sectionId} textarea[name="${fieldName}"],
                                     [data-section="${sectionId}"] input[name="${fieldName}"]`,
                                );
                                el?.focus();
                            }, 350);
                        });
                    });
                }
                setIsSubmitting(false);
                toast.dismiss(toastId);
                return;
            }

            await submit(false);
            toast.success("Pendaftaran berhasil dikirim!", { id: toastId });
            router.push(`/account`);
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Terjadi kesalahan";
            toast.error(message, { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (statusLoading) <RegistrationSkeleton />;

    return (
        <FormProvider {...methods}>
            <form
                className={styles.registrationPage}
                onSubmit={handleSubmit(onSubmit)}
            >
                <Sidebar
                    level={level}
                    onNavClick={expandAndScroll}
                    sectionStatuses={sectionStatuses}
                />

                <main className={styles.mainContent}>
                    <div className={styles.pageHeader}>
                        <h1 className={styles.pageTitle}>
                            {t("pageTitle", { programType: event.programType })}
                        </h1>
                        <p className={styles.pageSubtitle}>
                            {t("pageSubtitle", { batchName: event.batchName })}
                        </p>
                    </div>

                    {level === "S1" ? (
                        <>
                            <div id="identity" data-section="identity">
                                <MemoS1Identitas
                                    user={user}
                                    unmaskedNik={unmaskedNik}
                                    status={sectionStatuses.identity}
                                    collapsed={collapsed.identity}
                                    onToggle={() => toggleSection("identity")}
                                    readOnly={isReadOnly}
                                />
                            </div>
                            <div id="education" data-section="education">
                                <MemoS1Pendidikan
                                    batchType={event.batchType}
                                    programOptions={programOptions}
                                    status={sectionStatuses.education}
                                    collapsed={collapsed.education}
                                    onToggle={() => toggleSection("education")}
                                    readOnly={isReadOnly}
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <div id="biodata" data-section="biodata">
                                <MemoS2Biodata
                                    user={user}
                                    unmaskedNik={unmaskedNik}
                                    programOptions={programOptions}
                                    status={sectionStatuses.biodata}
                                    collapsed={collapsed.biodata}
                                    onToggle={() => toggleSection("biodata")}
                                    readOnly={isReadOnly}
                                />
                            </div>
                            <div id="parent" data-section="parent">
                                <MemoS2OrangTua
                                    status={sectionStatuses.parent}
                                    collapsed={collapsed.parent}
                                    onToggle={() => toggleSection("parent")}
                                    readOnly={isReadOnly}
                                />
                            </div>
                        </>
                    )}

                    <div id="document" data-section="document">
                        <MemoDokumen
                            level={level}
                            batchType={event.batchType}
                            status={sectionStatuses.document}
                            collapsed={collapsed.document}
                            onToggle={() => toggleSection("document")}
                            readOnly={isReadOnly}
                        />
                    </div>

                    <div id="payment" data-section="payment">
                        <MemoPembayaran
                            paymentConfig={paymentConfig}
                            status={sectionStatuses.payment}
                            collapsed={collapsed.payment}
                            onToggle={() => toggleSection("payment")}
                            readOnly={isReadOnly}
                        />
                    </div>

                    {!isReadOnly && (
                        <div
                            className={styles.confirmationBox}
                            id="declarations"
                        >
                            {level === "S1" && (
                                <Controller
                                    name="jenisdaftar"
                                    control={control}
                                    render={({ field }) =>
                                        field.value === "BARU" ? (
                                            <Controller
                                                name="confirmation"
                                                control={control}
                                                render={({ field: cf }) => (
                                                    <BaruDeclarationCheckbox
                                                        checked={cf.value}
                                                        onChange={cf.onChange}
                                                        label={t(
                                                            "checkboxes.baruDeclaration",
                                                        )}
                                                    />
                                                )}
                                            />
                                        ) : (
                                            <></>
                                        )
                                    }
                                />
                            )}
                            <Controller
                                name="pernyataan"
                                control={control}
                                render={({ field }) => (
                                    <label className={styles.checkboxLabel}>
                                        <input
                                            type="checkbox"
                                            checked={field.value}
                                            onChange={(e) =>
                                                field.onChange(e.target.checked)
                                            }
                                        />
                                        {t("checkboxes.finalDeclaration")}
                                    </label>
                                )}
                            />
                            <div className={styles.submitBar}>
                                <button
                                    type="button"
                                    className={`${styles.btn} ${styles.secondary}`}
                                    onClick={async () => {
                                        setIsSubmitting(true);
                                        const toastId =
                                            toast.loading("Menyimpan draft...");
                                        try {
                                            await submit(true);
                                            toast.success(
                                                "Draft berhasil disimpan!",
                                                { id: toastId },
                                            );
                                            router.replace(
                                                `/registration/${batchKey}?edit=1`,
                                            );
                                        } catch (err) {
                                            const message =
                                                err instanceof Error
                                                    ? err.message
                                                    : "Terjadi kesalahan";
                                            toast.error(message, {
                                                id: toastId,
                                            });
                                        } finally {
                                            setIsSubmitting(false);
                                        }
                                    }}
                                    disabled={isSubmitting}
                                >
                                    {t("buttons.saveDraft")}
                                </button>
                                <button
                                    type="submit"
                                    className={`${styles.btn} ${styles.primary}`}
                                    disabled={isSubmitting}
                                >
                                    <SendIcon /> {t("buttons.submit")}
                                </button>
                            </div>
                        </div>
                    )}
                </main>
            </form>
        </FormProvider>
    );
}
