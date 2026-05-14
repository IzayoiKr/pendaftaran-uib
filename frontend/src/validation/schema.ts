import z from "zod";

export const loginSchema = z.object({
    email: z
        .email("Format email tidak valid")
        .min(1, "Email wajib diisi"),
    password: z
        .string()
        .min(1, "Password wajib diisi")
});

export const registerSchema = z.object({
    fullName: z
        .string()
        .min(1, "Nama lengkap wajib diisi"),
    nik: z
        .string()
        .length(16, "NIK harus 16 digit")
        .regex(/^\d+$/, "NIK harus berupa angka"),
    email: z
        .email("Format email tidak valid")
        .min(1, "Email wajib diisi"),
    password: z
        .string()
        .min(8, "Password minimal 8 karakter")
        .max(72, "Password terlalu panjang"),
    retypePassword: z
        .string()
        .min(8, "Konfirmasi password wajib diisi")
}).refine((data) => data.password === data.retypePassword, {
    message: "Password dan konfirmasi tidak cocok",
    path: ["retypePassword"]
});

export const forgotPasswordSchema = z.object({
    email: z
        .email("Format email tidak valid")
        .min(1, "Email wajib diisi"),
    nik: z
        .string()
        .length(16, "NIK harus 16 digit")
        .regex(/^\d+$/, "NIK harus berupa angka"),
});

export const updateProfileSchema = z.object({
    fullName: z
        .string()
        .min(1, "Nama lengkap wajib diisi")
})

export const changePasswordSchema = z.object({
    oldPassword: z
        .string()
        .min(1, "Password lama wajib diisi"),
    newPassword: z
        .string()
        .min(8, "Password baru minimal 8 karakter")
        .max(72, "Password baru maksimal 72 karakter"),
    confirmPassword: z
        .string()
        .min(1, "Konfirmasi password wajib diisi"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Password baru dan konfirmasi tidak cocok",
    path: ["confirmPassword"],
}).refine((data) => data.oldPassword !== data.newPassword, {
    message: "Password baru harus berbeda dari password lama",
    path: ["newPassword"],
});

export const resetPasswordSchema = z.object({
    newPassword: z
        .string()
        .min(8, "Password minimal 8 karakter")
        .max(72, "Password maksimal 72 karakter"),
    confirmPassword: z
        .string()
        .min(1, "Konfirmasi password wajib diisi"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Password dan konfirmasi tidak cocok",
    path: ["confirmPassword"],
});

export type LoginValidation = z.infer<typeof loginSchema>;
export type RegisterValidation = z.infer<typeof registerSchema>;
export type ForgotPasswordValidation = z.infer<typeof forgotPasswordSchema>;
export type UpdateProfileValidation = z.infer<typeof updateProfileSchema>;
export type ChangePasswordValidation = z.infer<typeof changePasswordSchema>;
export type ResetPasswordValidation = z.infer<typeof resetPasswordSchema>;
