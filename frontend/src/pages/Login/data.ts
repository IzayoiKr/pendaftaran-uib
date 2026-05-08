import type { Form } from "@/types/ui"

export const login: Form[] = [
    {
        name: "email",
        type: "email",
        placeholder: "Email",
        autoComplete: "email"
    },
    {
        name: "password",
        type: "password",
        placeholder: "Password",
        autoComplete: "current-password",
        minLength: 8
    }
]
