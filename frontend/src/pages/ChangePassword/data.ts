import type { Form } from "@/types/ui";

export const changePassword: Form[] = [
    {
        name: "oldPassword",
        placeholderKey: "oldPasswordPlaceholder",
        type: "password",
        autoComplete: "new-password",
    },
    {
        name: "newPassword",
        placeholderKey: "newPasswordPlaceholder",
        type: "password",
        autoComplete: "new-password",
        minLength: 8,
    },
    {
        name: "confirmPassword",
        placeholderKey: "confirmPasswordPlaceholder",
        type: "password",
        autoComplete: "new-password",
    },
];
