'use client';

import { forwardRef, useImperativeHandle, useRef } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import type { TurnstileInstance } from "@marsidev/react-turnstile";
import { toast } from "sonner";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY as string;

export interface TurnstileHandle {
    reset: () => void;
}

interface TurnstileWidgetProps {
    onTokenChange: (token: string | null) => void;
    className?: string;
}

const TurnstileWidget = forwardRef<TurnstileHandle, TurnstileWidgetProps>(
    ({ onTokenChange, className }, ref) => {
        const turnstileRef = useRef<TurnstileInstance>(null);

        useImperativeHandle(ref, () => ({
            reset: () => turnstileRef.current?.reset(),
        }));

        return (
            <div className={className}>
                <Turnstile
                    ref={turnstileRef}
                    siteKey={SITE_KEY}
                    onSuccess={(token) => onTokenChange(token)}
                    onExpire={() => onTokenChange(null)}
                    onError={() => {
                        onTokenChange(null);
                        toast.error("Verifikasi CAPTCHA gagal, coba muat ulang halaman");
                    }}
                    options={{ theme: "light", language: "id" }}
                />
            </div>
        );
    }
);

TurnstileWidget.displayName = "TurnstileWidget"

export default TurnstileWidget;
