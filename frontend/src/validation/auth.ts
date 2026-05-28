import z from "zod";
import { emailSchema, fullNameSchema, nikSchema } from "./shared";
import type { T } from "./shared";

const passwordSchema = (t: T, label: string = "Password") =>
    z
        .string()
        .min(8, t("passwordMin", { label: label, count: 8 }))
        .max(128, t("passwordMax", { label: label }));

const confirmPasswordSchema = (t: T) =>
    z
        .string()
        .min(8, t("confirmPasswordMin", { count: 8 }))
        .max(72, t("confirmPasswordMax"));

export const loginSchema = (t: T) =>
    z.object({
        email: emailSchema(t),
        password: passwordSchema(t),
    });

export const registerSchema = (t: T) =>
    z
        .object({
            fullName: fullNameSchema(t),
            nik: nikSchema(t),
            email: emailSchema(t),
            password: passwordSchema(t),
            confirmPassword: confirmPasswordSchema(t),
        })
        .refine((data) => data.password === data.confirmPassword, {
            message: t("passwordMismatch"),
            path: ["confirmPassword"],
        });

export const forgotPasswordSchema = (t: T) =>
    z.object({
        email: emailSchema(t),
    });

export const updateProfileSchema = (t: T) =>
    z.object({
        fullName: fullNameSchema(t),
    });

export const changePasswordSchema = (t: T) =>
    z
        .object({
            oldPassword: passwordSchema(t, t("oldPasswordLabel")),
            newPassword: passwordSchema(t, t("newPasswordLabel")),
            confirmPassword: confirmPasswordSchema(t),
        })
        .refine((data) => data.newPassword === data.confirmPassword, {
            message: t("newPasswordMismatch"),
            path: ["confirmPassword"],
        })
        .refine((data) => data.oldPassword !== data.newPassword, {
            message: t("newPasswordMustDiff"),
            path: ["newPassword"],
        });

export const resetPasswordSchema = (t: T) =>
    z
        .object({
            newPassword: passwordSchema(t),
            confirmPassword: confirmPasswordSchema(t),
        })
        .refine((data) => data.newPassword === data.confirmPassword, {
            message: t("resetPasswordMismatch"),
            path: ["confirmPassword"],
        });

export type LoginValidation = z.infer<typeof loginSchema>;
export type RegisterValidation = z.infer<typeof registerSchema>;
export type ForgotPasswordValidation = z.infer<typeof forgotPasswordSchema>;
export type UpdateProfileValidation = z.infer<typeof updateProfileSchema>;
export type ChangePasswordValidation = z.infer<typeof changePasswordSchema>;
export type ResetPasswordValidation = z.infer<typeof resetPasswordSchema>;
