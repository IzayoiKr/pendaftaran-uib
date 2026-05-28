"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import FormField from "./FormField";

interface PhoneFieldProps {
    label: string;
    name: string;
    required?: boolean;
    placeholder?: string;
    value?: string;
    onChange?: (val: string) => void;
    error?: string;
}

function normalizeToE164(value: string): {
    formatted: string;
    valid: boolean;
    ambiguous: boolean;
} {
    const digits = value.trim();

    if (!digits) return { formatted: "", valid: true, ambiguous: false };

    const hasPlus = digits.startsWith("+");
    let clean = digits.replace(/\D/g, "");

    if (hasPlus) {
        clean = "+" + clean;
    }

    if (!hasPlus) {
        if (clean.startsWith("08")) {
            const national = clean.replace(/^0+/, "");
            if (national.length < 8) {
                return { formatted: clean, valid: false, ambiguous: false };
            }
            return {
                formatted: "+62" + national,
                valid: true,
                ambiguous: false,
            };
        }
        if (clean.length >= 8 && clean.length <= 15) {
            return { formatted: clean, valid: false, ambiguous: true };
        }
        return { formatted: clean, valid: false, ambiguous: false };
    }

    if (clean.length < 3) {
        return { formatted: clean, valid: false, ambiguous: false };
    }

    const match = clean.match(/^\+(\d{1,3})(\d{4,14})$/);
    if (!match) {
        return { formatted: clean, valid: false, ambiguous: false };
    }

    const totalDigits = match[1].length + match[2].length;
    if (totalDigits < 7 || totalDigits > 15) {
        return { formatted: clean, valid: false, ambiguous: false };
    }

    return { formatted: clean, valid: true, ambiguous: false };
}

export default function PhoneField({
    label,
    name,
    required,
    placeholder,
    value = "",
    onChange,
    error,
}: PhoneFieldProps) {
    const t = useTranslations("registration");
    const [localError, setLocalError] = useState<string | undefined>(undefined);
    const [displayValue, setDisplayValue] = useState(value);

    const isInternalChange = useRef(false);

    useEffect(() => {
        if (isInternalChange.current) {
            isInternalChange.current = false;
            return;
        }
        setDisplayValue(value);
    }, [value]);

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            let val = e.target.value.replace(/[^+\d\s\-()]/g, "");

            const digitsOnly = val.replace(/\D/g, "");
            if (digitsOnly.length > 15) {
                let digitCount = 0;
                let truncated = "";
                for (const ch of val) {
                    if (/\d/.test(ch)) {
                        if (digitCount >= 15) continue;
                        digitCount++;
                    }
                    truncated += ch;
                }
                val = truncated;
            }

            isInternalChange.current = true;
            setDisplayValue(val);
            onChange?.(val);
            setLocalError(undefined);
        },
        [onChange],
    );

    const handleBlur = useCallback(() => {
        if (!displayValue.trim()) {
            setLocalError(undefined);
            return;
        }

        const result = normalizeToE164(displayValue);

        if (result.ambiguous) {
            setLocalError(t("validation.phoneAmbiguous"));
            return;
        }
        if (!result.valid) {
            setLocalError(t("validation.phoneInvalid"));
            return;
        }

        isInternalChange.current = true;
        setDisplayValue(result.formatted);
        onChange?.(result.formatted);
        setLocalError(undefined);
    }, [displayValue, onChange, t]);

    return (
        <FormField
            label={label}
            required={required}
            error={error || localError}
        >
            <input
                type="tel"
                name={name}
                placeholder={placeholder}
                value={displayValue}
                onChange={handleChange}
                onBlur={handleBlur}
                inputMode="tel"
                autoComplete="tel"
            />
        </FormField>
    );
}
