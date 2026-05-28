import type { Form } from "@/types/ui";

export const resetPassword: Form[] = [
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
