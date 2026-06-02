"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/api";
import type { DocumentField, RegistrationFormValues } from "./types";

export interface RegistrationStatusResult {
    status: "NONE" | "DRAFT" | "REJECTED" | "SUBMITTED" | "VERIFIED";
    draftData?: Partial<RegistrationFormValues>;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
}

function parseFileField(value: unknown): DocumentField {
    if (value === null || value === undefined) return null;
    if (typeof value === "string" && value.includes("|")) {
        return value;
    }
    return null;
}

export function useRegistrationStatus(batchKey: string | undefined) {
    const router = useRouter();
    const params = useSearchParams();
    const isEditMode = params?.get("edit") === "1";
    const isViewMode = params?.get("view") === "1";

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["registration", "status", batchKey],
        queryFn: async () => {
            if (!batchKey) throw new Error("Batch key required");
            const res = await api.registrations.status(batchKey);
            return res as unknown as {
                status:
                | "NONE"
                | "DRAFT"
                | "SUBMITTED"
                | "VERIFIED"
                | "REJECTED";
                draft_data?: Partial<RegistrationFormValues>;
            };
        },
        enabled: !!batchKey,
        staleTime: 0,
        retry: false,
    });

    useEffect(() => {
        if (!data || !batchKey) return;

        if (
            !isViewMode &&
            (data.status === "SUBMITTED" || data.status === "VERIFIED")
        ) {
            toast.warning(
                "Formulir ini sudah disubmit atau sudah diverifikasi!",
            );
            router.replace("/account");
            return;
        }

        if (!isEditMode && data.status === "REJECTED") {
            toast.warning(
                "Pendaftaran Anda ditolak. Silakan periksa akun Anda.",
            );
            router.replace("/account");
            return;
        }

        if (!isEditMode && !isViewMode && data.status === "DRAFT") {
            router.replace(`/registration/${batchKey}?edit=1`);
            return;
        }
    }, [data, isEditMode, isViewMode, batchKey, router]);

    const transformedDraftData: Partial<RegistrationFormValues> | undefined =
        data?.draft_data
            ? {
                ...data.draft_data,
                pp: parseFileField(data.draft_data.pp),
                ktp: parseFileField(data.draft_data.ktp),
                kk: parseFileField(data.draft_data.kk),
                transkripNilai: parseFileField(
                    data.draft_data.transkripNilai,
                ),
                ijazahDok: parseFileField(data.draft_data.ijazahDok),
                sktmKip: parseFileField(data.draft_data.sktmKip),
                fotoRumah: parseFileField(data.draft_data.fotoRumah),
                tagihanListrik: parseFileField(
                    data.draft_data.tagihanListrik,
                ),
                tagihanAir: parseFileField(data.draft_data.tagihanAir),
                sertifikatPrestasi: parseFileField(
                    data.draft_data.sertifikatPrestasi,
                ),
                rapot1: parseFileField(data.draft_data.rapot1),
                rapot2: parseFileField(data.draft_data.rapot2),
                rapot3: parseFileField(data.draft_data.rapot3),
                rapot4: parseFileField(data.draft_data.rapot4),
                al: parseFileField(data.draft_data.al),
                r1: parseFileField(data.draft_data.r1),
                r2: parseFileField(data.draft_data.r2),
                paymentProof: parseFileField(data.draft_data.paymentProof),
            }
            : undefined;

    return {
        status: data?.status ?? "NONE",
        draftData: transformedDraftData,
        isLoading,
        isError,
        error: error as Error | null,
        isViewMode,
    };
}
