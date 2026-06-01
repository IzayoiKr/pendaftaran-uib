import { useTranslations } from "next-intl";
import FormField from "./FormField";

interface SelectFieldProps {
    label: string;
    name: string;
    options: Array<{ value: string | number; label: string }>;
    required?: boolean;
    error?: string;
    placeholder?: string;
    value?: string;
    onChange?: (val: string) => void;
    translateLabels?: boolean;
    readOnly?: boolean;
}

export default function SelectField({
    label,
    name,
    options,
    required,
    error,
    placeholder = "Pilih...",
    value,
    onChange,
    translateLabels = true,
    readOnly = false,
}: SelectFieldProps) {
    const t = useTranslations("options");

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onChange?.(e.target.value);
    };

    return (
        <FormField label={label} required={required} error={error}>
            <select name={name} value={value ?? ""} onChange={handleChange} disabled={readOnly}>
                <option value="" disabled={readOnly}>{placeholder}</option>
                {options.map((o) => (
                    <option key={o.value} value={o.value} disabled={readOnly}>
                        {translateLabels ? t(o.label) : o.label}
                    </option>
                ))}
            </select>
        </FormField>
    );
}
