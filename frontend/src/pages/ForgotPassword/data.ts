import type { Form } from "@/types/ui"

export const forgotPassword: Form[] = [
    {
        name: "email",
        type: "email",
        placeholder: "Email saat daftar (Registration Email) *",
        autoComplete: "email"
    },
    {
        name: "nik",
        type: "text",
        placeholder: "NIK saat daftar (Registration National Identification Number) *",
        autoComplete: "off",
        maxLength: 16
    }
]
