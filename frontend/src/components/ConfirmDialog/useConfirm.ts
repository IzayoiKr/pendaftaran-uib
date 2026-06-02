"use client";

import { useCallback, useState } from "react";
import type { ConfirmDialogProps } from "./ConfirmDialog";

interface ConfirmOptions {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: ConfirmDialogProps["variant"];
}

interface ConfirmState extends ConfirmOptions {
    isOpen: boolean;
    resolve: ((value: boolean) => void) | null;
    isLoading: boolean;
}

export function useConfirm() {
    const [state, setState] = useState<ConfirmState>({
        isOpen: false,
        title: "",
        message: "",
        resolve: null,
        isLoading: false,
    });

    const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
        return new Promise((resolve) => {
            setState({
                isOpen: true,
                ...options,
                resolve,
                isLoading: false,
            });
        });
    }, []);

    const handleConfirm = useCallback(() => {
        setState((prev) => {
            prev.resolve?.(true);
            return { ...prev, isOpen: false, resolve: null };
        });
    }, []);

    const handleCancel = useCallback(() => {
        setState((prev) => {
            prev.resolve?.(false);
            return { ...prev, isOpen: false, resolve: null };
        });
    }, []);

    const setLoading = useCallback((loading: boolean) => {
        setState((prev) => ({ ...prev, isLoading: loading }));
    }, []);

    const dialogProps: Omit<ConfirmDialogProps, "onConfirm" | "onCancel"> & {
        onConfirm: () => void;
        onCancel: () => void;
    } = {
        isOpen: state.isOpen,
        title: state.title,
        message: state.message,
        confirmLabel: state.confirmLabel,
        cancelLabel: state.cancelLabel,
        variant: state.variant,
        isLoading: state.isLoading,
        onConfirm: handleConfirm,
        onCancel: handleCancel,
    };

    return { confirm, dialogProps, setLoading };
}
