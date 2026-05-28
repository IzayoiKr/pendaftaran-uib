import type { Form } from "@/types/ui";

export const register: Form[] = [
    {
        name: "fullName",
        labelKey: "fullNameLabel",
        type: "text",
        autoComplete: "name",
    },
    {
        name: "nik",
        labelKey: "nikLabel",
        type: "text",
        autoComplete: "off",
        maxLength: 20,
    },
    {
        name: "email",
        labelKey: "emailLabel",
        type: "email",
        autoComplete: "email",
    },
    {
        name: "password",
        labelKey: "passwordLabel",
        type: "password",
        autoComplete: "new-password",
        minLength: 8,
    },
    {
        name: "confirmPassword",
        labelKey: "confirmPasswordLabel",
        type: "password",
        autoComplete: "new-password",
    },
];
