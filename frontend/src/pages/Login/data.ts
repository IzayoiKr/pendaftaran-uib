import type { Form } from "@/types/ui";

export const login: Form[] = [
    {
        name: "email",
        type: "email",
        placeholderKey: "emailLabel",
        autoComplete: "email",
    },
    {
        name: "password",
        type: "password",
        placeholderKey: "passwordLabel",
        autoComplete: "current-password",
        minLength: 8,
    },
];
