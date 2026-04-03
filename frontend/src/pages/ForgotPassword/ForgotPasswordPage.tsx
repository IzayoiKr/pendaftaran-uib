import { useState, type ChangeEvent, type FormEvent } from "react";
import "./ForgotPasswordPage.scss";

interface ForgotForm {
    email: string;
    nik: string;
}

function ForgotInput({ type, name, placeholder, value, autoComplete, onChange }: {
    type: "email" | "text";
    name: keyof ForgotForm;
    placeholder: string;
    value: string;
    autoComplete: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
    return (
        <input
            type={type}
            name={name}
            className="single-input"
            placeholder={placeholder}
            value={value}
            autoComplete={autoComplete}
            onChange={onChange}
            required
        />
    );
}

function ResetButton({ isLoading }: { isLoading: boolean }) {
    return (
        <button type="submit" className="reset-btn" disabled={isLoading} aria-busy={isLoading}>
            {isLoading
                ? <><div className="spinner" aria-hidden="true" /> Reset</>
                : <>Reset &#8594;</>
            }
        </button>
    );
}

export default function ForgotPasswordPage() {
    const [form, setForm] = useState<ForgotForm>({ email: "", nik: "" });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await new Promise(r => setTimeout(r, 1000)); // TODO: ganti API call
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="page-content">
            <div className="forgot-box">
                <h3 className="forgot-title">Lupa Password</h3>
                <p className="forgot-required">* Wajib di Isi (Required)</p>
                <form onSubmit={handleSubmit} noValidate>
                    <ForgotInput
                        type="email"
                        name="email"
                        placeholder="Email saat daftar (Registration Email) *"
                        value={form.email}
                        autoComplete="email"
                        onChange={handleChange}
                    />
                    <ForgotInput
                        type="text"
                        name="nik"
                        placeholder="NIK saat daftar (Registration National Identification Number) *"
                        value={form.nik}
                        autoComplete="off"
                        onChange={handleChange}
                    />
                    <div>
                        <ResetButton isLoading={isLoading} />
                    </div>
                </form>
            </div>
        </div>
    );
}
