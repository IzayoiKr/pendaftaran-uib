import styles from "./FormField.module.scss";

interface FormFieldProps {
    label: string;
    required?: boolean;
    error?: string;
    children: React.ReactNode;
    hint?: string;
}

export default function FormField({
    label,
    required,
    error,
    children,
    hint,
}: FormFieldProps) {
    return (
        <div className={`${styles.formField} ${error ? styles.hasError : ""}`}>
            <label>
                {label}
                {required && <span className={styles.required}>*</span>}
            </label>
            {children}
            {hint && <span className={styles.hint}>{hint}</span>}
            {error && <span className={styles.error}>{error}</span>}
        </div>
    );
}
