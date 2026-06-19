import {
    AGAMA,
    JENIS_DAFTAR,
    JENIS_KELAMIN,
    JENJANG_PENDIDIKAN,
    KEWARGANEGARAAN,
    PEKERJAAN,
    PENDIDIKAN,
    PENGHASILAN,
    STATUS_INSTANSI,
    STATUS_ORANG_TUA,
    SUMBER_BIAYA,
    WAKTU_KULIAH,
} from "@/views/Registration/valueOptions";
import { z } from "zod";

export type TV = (
    key: string,
    options?: {
        label?: string;
        count?: number;
        min?: number;
        max?: number;
        size?: string;
    },
) => string;

export const MAX_FILE_SIZE = 2 * 1024 * 1024;
export const ACCEPTED_MIME_TYPES = ["application/pdf"];

export const PHONE_E164_REGEX = /^\+[1-9]\d{1,14}$/;
export const YEAR_REGEX = /^\d{4}$/;

export const jenisKelaminValues = Object.values(JENIS_KELAMIN);
export const kewarganegaraanValues = Object.values(KEWARGANEGARAAN);
export const jenjangPendidikanValues = Object.values(JENJANG_PENDIDIKAN);
export const agamaValues = Object.values(AGAMA);
export const sumberBiayaValues = Object.values(SUMBER_BIAYA);
export const statusInstansiValues = Object.values(STATUS_INSTANSI);
export const jenisDaftarValues = Object.values(JENIS_DAFTAR);
export const waktuKuliahValues = Object.values(WAKTU_KULIAH);
export const pendidikanValues = Object.values(PENDIDIKAN);
export const pekerjaanValues = Object.values(PEKERJAAN);
export const penghasilanValues = Object.values(PENGHASILAN);
export const statusOrangTuaValues = Object.values(STATUS_ORANG_TUA);

function emptyToUndefined(val: unknown): unknown {
    if (val === null || val === undefined) return undefined;
    if (typeof val === "string" && val.trim() === "") return undefined;
    if (Array.isArray(val) && val.length === 0) return undefined;
    return val;
}

export function reqString(t: TV, fieldKey: string, maxLen: number) {
    return z.preprocess(
        emptyToUndefined,
        z
            .string()
            .trim()
            .min(1, { error: t(`registration.${fieldKey}Required`) })
            .max(maxLen, {
                error: t(`registration.${fieldKey}Max`, { count: maxLen }),
            }),
    );
}

export function optString(t: TV, fieldKey: string, maxLen: number) {
    return z.preprocess(
        emptyToUndefined,
        z
            .string()
            .trim()
            .max(maxLen, {
                error: t(`registration.${fieldKey}Max`, { count: maxLen }),
            })
            .optional(),
    );
}

export function reqEmail(t: TV, fieldKey: string) {
    return z.preprocess(
        emptyToUndefined,
        z
            .string()
            .trim()
            .toLowerCase()
            .min(1, { error: t(`registration.${fieldKey}Required`) })
            .max(320, {
                error: t(`registration.${fieldKey}Max`, { count: 320 }),
            })
            .email({ error: t(`registration.${fieldKey}Invalid`) }),
    );
}

export function optEmail(t: TV, fieldKey: string) {
    return z.preprocess(
        emptyToUndefined,
        z
            .string()
            .trim()
            .toLowerCase()
            .max(320, {
                error: t(`registration.${fieldKey}Max`, { count: 320 }),
            })
            .email({ error: t(`registration.${fieldKey}Invalid`) })
            .optional(),
    );
}

export function reqPhone(t: TV, fieldKey: string) {
    return z.preprocess(
        emptyToUndefined,
        z
            .string()
            .trim()
            .min(1, { error: t(`registration.${fieldKey}Required`) })
            .regex(PHONE_E164_REGEX, {
                error: t(`registration.${fieldKey}Invalid`),
            }),
    );
}

export function optPhone(t: TV, fieldKey: string) {
    return z.preprocess(
        emptyToUndefined,
        z
            .string()
            .trim()
            .regex(PHONE_E164_REGEX, {
                error: t(`registration.${fieldKey}Invalid`),
            })
            .optional(),
    );
}

export function reqDate(t: TV, fieldKey: string) {
    return z.preprocess(
        emptyToUndefined,
        z
            .string()
            .trim()
            .min(1, { error: t(`registration.${fieldKey}Required`) })
            .date(t(`registration.${fieldKey}Format`)),
    );
}

export function optDate(t: TV, fieldKey: string) {
    return z.preprocess(
        emptyToUndefined,
        z
            .string()
            .trim()
            .date(t(`registration.${fieldKey}Format`))
            .optional(),
    );
}

export function reqYear(
    t: TV,
    fieldKey: string,
    minYear: number,
    maxYear: number,
) {
    return z.preprocess(
        emptyToUndefined,
        z
            .string()
            .trim()
            .min(1, { error: t(`registration.${fieldKey}Required`) })
            .regex(YEAR_REGEX, { error: t(`registration.${fieldKey}Format`) })
            .refine(
                (val) => {
                    const y = parseInt(val, 10);
                    return !isNaN(y) && y >= minYear && y <= maxYear;
                },
                {
                    error: t(`registration.${fieldKey}Range`, {
                        min: minYear,
                        max: maxYear,
                    }),
                },
            ),
    );
}

export function optYear(
    t: TV,
    fieldKey: string,
    minYear: number,
    maxYear: number,
) {
    return z.preprocess(
        emptyToUndefined,
        z
            .string()
            .trim()
            .regex(YEAR_REGEX, { error: t(`registration.${fieldKey}Format`) })
            .refine(
                (val) => {
                    const y = parseInt(val, 10);
                    return !isNaN(y) && y >= minYear && y <= maxYear;
                },
                {
                    error: t(`registration.${fieldKey}Range`, {
                        min: minYear,
                        max: maxYear,
                    }),
                },
            )
            .optional(),
    );
}

export function reqEnum<T extends string>(
    t: TV,
    fieldKey: string,
    values: readonly T[],
) {
    return z.preprocess(
        emptyToUndefined,
        z.enum(values as [T, ...T[]], {
            error: t(`registration.${fieldKey}Required`),
        }),
    );
}

export function optEnum<T extends string>(
    t: TV,
    fieldKey: string,
    values: readonly T[],
) {
    return z.preprocess(
        emptyToUndefined,
        z
            .enum(values as [T, ...T[]], {
                error: t(`registration.${fieldKey}Invalid`),
            })
            .optional(),
    );
}

export function reqGpa(t: TV, fieldKey: string) {
    return z.preprocess(
        emptyToUndefined,
        z
            .string()
            .trim()
            .min(1, { error: t(`registration.${fieldKey}Required`) })
            .refine(
                (val) => {
                    const num = parseFloat(val);
                    return !isNaN(num) && num >= 0 && num <= 4;
                },
                { error: t(`registration.${fieldKey}Range`) },
            ),
    );
}

export function optGpa(t: TV, fieldKey: string) {
    return z.preprocess(
        emptyToUndefined,
        z
            .string()
            .trim()
            .refine(
                (val) => {
                    const num = parseFloat(val);
                    return !isNaN(num) && num >= 0 && num <= 4;
                },
                { error: t(`registration.${fieldKey}Range`) },
            )
            .optional(),
    );
}

export function reqHsGpa(t: TV, fieldKey: string) {
    return z.preprocess(
        emptyToUndefined,
        z
            .string()
            .trim()
            .min(1, { error: t(`registration.${fieldKey}Required`) })
            .refine(
                (val) => {
                    const num = parseFloat(val);
                    return !isNaN(num) && num >= 0 && num <= 100;
                },
                { error: t(`registration.${fieldKey}Range`) },
            ),
    );
}

export function optHsGpa(t: TV, fieldKey: string) {
    return z.preprocess(
        emptyToUndefined,
        z
            .string()
            .trim()
            .refine(
                (val) => {
                    const num = parseFloat(val);
                    return !isNaN(num) && num >= 0 && num <= 100;
                },
                { error: t(`registration.${fieldKey}Range`) },
            )
            .optional(),
    );
}

const newFileUpload = (t: TV, fieldKey: string) =>
    z.preprocess(
        (val) => (val instanceof File ? val : undefined),
        z
            .file()
            .max(MAX_FILE_SIZE, {
                message: t(`registration.${fieldKey}Size`, { size: "2MB" }),
            })
            .mime(ACCEPTED_MIME_TYPES, {
                error: t(`registration.${fieldKey}Type`),
            })
            .refine(
                (f) => f.type !== "" || f.name.toLowerCase().endsWith(".pdf"),
                { message: t(`registration.${fieldKey}Type`) },
            ),
    );

const existingDbRef = (t: TV, fieldKey: string) =>
    z.string().regex(/^[^|]+\|\d+$/, {
        message: t(`registration.${fieldKey}Invalid`),
    });

export function reqDoc(t: TV, fieldKey: string) {
    return z.union([newFileUpload(t, fieldKey), existingDbRef(t, fieldKey)], {
        error: t(`registration.${fieldKey}Required`),
    });
}

export function optDoc(t: TV, fieldKey: string) {
    return z
        .union([
            newFileUpload(t, fieldKey),
            existingDbRef(t, fieldKey),
            z.null(),
        ])
        .optional();
}

export function reqBoolean(t: TV, fieldKey: string) {
    return z.literal(true, { error: t(`registration.${fieldKey}Required`) });
}

export function optBoolean() {
    return z.boolean().optional();
}

export function paymentFields(t: TV) {
    return {
        accountHolder: reqString(t, "accountHolder", 255),
        bank: reqString(t, "bank", 100),
        paymentProof: reqDoc(t, "paymentProof"),
    };
}

export function paymentDraftFields(t: TV) {
    return {
        accountHolder: optString(t, "accountHolder", 255),
        bank: optString(t, "bank", 100),
        paymentProof: optDoc(t, "paymentProof"),
    };
}

export function finalDeclarationFields(t: TV) {
    return {
        pernyataan: reqBoolean(t, "pernyataan"),
    };
}

export function validateGpaString(
    gpa: string | undefined,
    ctx: z.RefinementCtx,
    path: string,
    t: TV,
) {
    if (!gpa || gpa.trim() === "") {
        ctx.addIssue({
            code: "custom",
            path: [path],
            message: t(`registration.${path}Required`),
        });
        return;
    }
    const gpaNum = parseFloat(gpa);
    if (isNaN(gpaNum) || gpaNum < 0 || gpaNum > 4) {
        ctx.addIssue({
            code: "custom",
            path: [path],
            message: t(`registration.${path}Range`),
        });
    }
}

export function validateRequiredString(
    value: string | undefined,
    ctx: z.RefinementCtx,
    path: string,
    message: string,
) {
    if (!value || value.trim() === "") {
        ctx.addIssue({
            code: "custom",
            path: [path],
            message,
        });
    }
}

export function validateRequiredFile(
    value: File | string | undefined | null,
    ctx: z.RefinementCtx,
    path: string,
    message: string,
) {
    if (!value) {
        ctx.addIssue({
            code: "custom",
            path: [path],
            message,
        });
    }
}
