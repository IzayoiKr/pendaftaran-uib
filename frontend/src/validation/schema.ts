import z from "zod";

const fullNameSchema = z
    .string()
    .trim()
    .min(1, "Nama wajib diisi")
    .max(255, "Nama terlalu panjang");

const emailSchema = z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid");

const passwordSchema = (label: string = "password") => z
    .string()
    .min(8, `${label} minimal 8 karakter`)
    .max(72, `${label} terlalu panjang`);

const confirmPasswordSchema = z
    .string()
    .min(8, `Konfirmasi password minimal 8 karakter`)
    .max(72, `Konfirmasi password terlalu panjang`);

export const loginSchema = z.object({
    email: emailSchema,
    password: passwordSchema()
});

export const registerSchema = z.object({
    fullName: fullNameSchema,
    nik: z
        .string()
        .trim()
        .min(6, "NIK minimal 6 karakter")
        .max(20, "NIK maksimal 20 karakter")
        .regex(/^[A-Za-z0-9]+$/, "NIK hanya boleh huruf dan angka"),
    email: emailSchema,
    password: passwordSchema(),
    confirmPassword: confirmPasswordSchema
}).refine((data) => data.password === data.confirmPassword, {
    message: "Password dan konfirmasi password tidak cocok",
    path: ["confirmPassword"]
});

export const forgotPasswordSchema = z.object({
    email: emailSchema
});

export const updateProfileSchema = z.object({
    fullName: fullNameSchema
})

export const changePasswordSchema = z.object({
    oldPassword: passwordSchema("Password Lama"),
    newPassword: passwordSchema("Password Baru"),
    confirmPassword: confirmPasswordSchema
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Password baru dan konfirmasi password baru tidak cocok",
    path: ["confirmPassword"],
}).refine((data) => data.oldPassword !== data.newPassword, {
    message: "Password baru harus berbeda dari password lama",
    path: ["newPassword"],
});

export const resetPasswordSchema = z.object({
    newPassword: passwordSchema(),
    confirmPassword: confirmPasswordSchema
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
