"use client";

import { useCallback } from "react";
import { api } from "@/api";
import { isExistingDoc, isNewUpload } from "./types";
import type { DocumentField, RegistrationFormValues } from "./types";

function buildRegistrationFormData(values: RegistrationFormValues): FormData {
    const formData = new FormData();
    const jsonPayload: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(values)) {
        const docValue = value as DocumentField;

        if (isNewUpload(docValue)) {
            formData.append(key, docValue, docValue.name);
        } else if (isExistingDoc(docValue)) {
            jsonPayload[key] = docValue;
        } else if (value !== null && value !== undefined && value != "") {
            jsonPayload[key] = value;
        }
    }

    formData.append("formData", JSON.stringify(jsonPayload));

    return formData;
}

export function useRegistrationSubmit(
    batchKey: string,
    getValues: () => RegistrationFormValues,
) {
    const submit = useCallback(
        async (isDraft: boolean) => {
            const values = getValues();
            const formData = buildRegistrationFormData(values);

            try {
                const endpoint = isDraft
                    ? api.registrations.draft
                    : api.registrations.submit;
                const response = await endpoint(batchKey, formData);
                return response;
            } catch (error) {
                if (error instanceof Error && "response" in error) {
                    const axiosError = error as {
                        response?: { data?: { error?: string } };
                    };
                    const message =
                        axiosError.response?.data?.error ?? "Terjadi kesalahan";
                    throw new Error(message);
                }
                throw error;
            }
        },
        [batchKey, getValues],
    );

    return { submit };
}
