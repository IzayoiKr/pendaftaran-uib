import type { Form } from "@/types/ui"

export const resetPassword: Form[] = [
    {
        name: "newPassword",
        placeholder: "Password Baru (New Password) *",
        type: "password",
        autoComplete: "new-password",
        minLength: 8
    },
    {
        name: "confirmPassword",
        placeholder: "Konfirmasi Password Baru (Confirm New Password) *",
        type: "password",
        autoComplete: "new-password",
    }
]
