import type { Form } from "@/types/ui"

export const register: Form[] = [
    {
        name: "fullName",
        label: "Nama Lengkap (FullName)",
        type: "text",
        autoComplete: "name",
    },
    {
        name: "nik",
        label: "No NIK (National Identification Number)",
        type: "text",
        autoComplete: "off",
        maxLength: 16
    },
    {
        name: "email",
        label: "Email *",
        type: "email",
        autoComplete: "email"
    },
    {
        name: "password",
        label: "Password *",
        type: "password",
        autoComplete: "new-password",
        minLength: 8
    },
    {
        name: "retypePassword",
        label: "Retype Password *",
        type: "password",
        autoComplete: "new-password",
    }
]
