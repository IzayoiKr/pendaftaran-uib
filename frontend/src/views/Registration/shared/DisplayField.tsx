import styles from "./DisplayField.module.scss";

interface DisplayFieldProps {
    label: string;
    value: string | React.ReactNode;
}

export default function DisplayField({ label, value }: DisplayFieldProps) {
    return (
        <div className={styles.displayField}>
            <span className={styles.displayLabel}>{label}</span>
            <div className={styles.displayValue}>
                <span className={styles.displayValueText}>{value || "-"}</span>
            </div>
        </div>
    );
}
