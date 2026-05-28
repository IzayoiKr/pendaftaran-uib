import z from "zod";

export type T = (
    key: string,
    options?: { label?: string; count?: number },
) => string;

export const fullNameSchema = (t: T) =>
    z.string().trim().min(1, t("fullNameRequired")).max(255, t("fullNameMax"));

export const nikSchema = (t: T) =>
    z
        .string()
        .trim()
        .min(6, t("nikMin", { count: 6 }))
        .max(20, t("nikMax", { count: 20 }))
        .regex(/^[A-Za-z0-9]+$/, t("nikAlphanumeric"));

export const emailSchema = (t: T) =>
    z
        .string()
        .trim()
        .toLowerCase()
        .min(1, t("emailRequired"))
        .email(t("emailInvalid"));
