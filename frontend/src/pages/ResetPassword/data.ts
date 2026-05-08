import type { Form } from "@/types/ui"

export const resetPassword: Form[] = [
    {
        name: "password",
        placeholder: "Password Baru (New Password) *",
        type: "password",
        autoComplete: "new-password",
        minLength: 8
    },
    {
        name: "retypePassword",
        placeholder: "Konfirmasi Password Baru (Confirm New Password) *",
        type: "password",
        autoComplete: "new-password",
    }
]
