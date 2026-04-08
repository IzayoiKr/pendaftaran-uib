import z from "zod";

export const loginSchema = z.object({
    email: z
        .string()
        .min(1, "Email wajib diisi")
        .email("Format email tidak valid"),
    password: z
        .string()
        .min(8, "Password minimal 8 karakter")
});

export const registerSchema = z.object({
    fullName: z
        .string()
        .min(1, "Nama lengkap wajib diisi"),
    nik: z
        .string()
        .min(16, "NIK harus 16 digit")
        .regex(/^\d+$/, "NIK harus berupa angka"),
    email: z
        .string()
        .min(1, "Email wajib diisi")
        .email("Format email tidak valid"),
    password: z
        .string()
        .min(8, "Password minimal 8 karakter"),
    retypePassword: z
        .string()
        .min(8, "Konfirmasi password wajib diisi")
}).refine((data) => data.password === data.retypePassword, {
    message: "Password dan konfirmasi tidak cocok",
    path: ["retypePassword"]
});

export type LoginValidation = z.infer<typeof loginSchema>;
export type RegisterValidation = z.infer<typeof registerSchema>;
