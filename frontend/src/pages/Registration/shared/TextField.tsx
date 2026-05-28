import FormField from "./FormField";

export type InputRestriction = "none" | "numeric" | "tel" | "decimal" | "email";

interface TextFieldProps {
    label: string;
    name: string;
    type?: string;
    required?: boolean;
    error?: string;
    placeholder?: string;
    step?: string;
    min?: string;
    max?: string;
    value?: string;
    onChange?: (val: string) => void;
    readOnly?: boolean;
    inputMode?: React.InputHTMLAttributes<HTMLInputElement>["inputMode"];
    pattern?: string;
    restriction?: InputRestriction;
    maxLength?: number;
}

function applyRestriction(
    value: string,
    restriction: InputRestriction,
): string {
    switch (restriction) {
        case "numeric":
            return value.replace(/\D/g, "");
        case "tel":
            return value.replace(/[^0-9+\-\s()]/g, "");
        case "decimal":
            const parts = value.replace(/[^0-9.]/g, "").split(".");
            if (parts.length > 2) {
                return parts[0] + "." + parts.slice(1).join("");
            }
            return value.replace(/[^0-9.]/g, "");
        case "email":
            return value.replace(/\s/g, "");
        case "none":
        default:
            return value;
    }
}

export default function TextField({
    label,
    name,
    type = "text",
    required,
    error,
    placeholder,
    step,
    min,
    max,
    value,
    onChange,
    readOnly,
    inputMode,
    pattern,
    restriction = "none",
    maxLength,
}: TextFieldProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let newValue = e.target.value;

        if (restriction !== "none") {
            newValue = applyRestriction(newValue, restriction);
        }

        if (
            (type === "number" ||
                restriction === "numeric" ||
                restriction === "decimal") &&
            max !== undefined &&
            newValue !== ""
        ) {
            const num = parseFloat(newValue);
            const maxNum = parseFloat(max);
            if (!isNaN(num) && !isNaN(maxNum) && num > maxNum) {
                newValue = max;
            }
        }

        onChange?.(newValue);
    };

    const effectivePattern =
        pattern ??
        (restriction === "numeric"
            ? "[0-9]*"
            : restriction === "tel"
              ? "[0-9+\\-\\s()]*"
              : restriction === "decimal"
                ? "[0-9]*[.]?[0-9]*"
                : undefined);

    return (
        <FormField label={label} required={required} error={error}>
            <input
                type={type}
                name={name}
                placeholder={placeholder}
                step={step}
                min={min}
                max={max}
                readOnly={readOnly}
                inputMode={inputMode}
                pattern={effectivePattern}
                maxLength={maxLength}
                value={value ?? ""}
                onChange={handleChange}
            />
        </FormField>
    );
}
