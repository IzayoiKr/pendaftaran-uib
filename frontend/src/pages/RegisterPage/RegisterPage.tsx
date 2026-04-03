import { useState, type ChangeEvent, type FormEvent } from "react";
import "./RegisterPage.scss";

interface RegisterForm {
    fullName: string;
    nik: string;
    email: string;
    password: string;
    retypePassword: string;
}

// Field config — driven by data, bukan hardcode per field
const FIELDS: {
    name: keyof RegisterForm;
    label: string;
    type: "text" | "email" | "password";
    autoComplete: string;
}[] = [
    { name: "fullName",       label: "Nama Lengkap (FullName) *",                                    type: "text",     autoComplete: "name" },
    { name: "nik",            label: "No NIK (National Identification Number) *",                     type: "text",     autoComplete: "off" },
    { name: "email",          label: "Email *",                                                       type: "email",    autoComplete: "email" },
    { name: "password",       label: "Password *",                                                    type: "password", autoComplete: "new-password" },
    { name: "retypePassword", label: "Retype Password *",                                             type: "password", autoComplete: "new-password" },
];

function RegisterField({ label, type, name, value, autoComplete, onChange }: {
    label: string;
    type: "text" | "email" | "password";
    name: keyof RegisterForm;
    value: string;
    autoComplete: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
    return (
        <div className="field-group">
            <label htmlFor={name}>{label}</label>
            <input
                id={name}
                type={type}
                name={name}
                className="single-input"
                value={value}
                autoComplete={autoComplete}
                onChange={onChange}
                required
            />
        </div>
    );
}

function RegisterButton({ isLoading }: { isLoading: boolean }) {
    return (
        <button type="submit" className="register-btn" disabled={isLoading} aria-busy={isLoading}>
            {isLoading
                ? <><div className="spinner" aria-hidden="true" /> Daftar</>
                : <>Daftar (Register) &#8594;</>
            }
        </button>
    );
}

export default function RegisterPage() {
    const [form, setForm] = useState<RegisterForm>({
        fullName: "", nik: "", email: "", password: "", retypePassword: "",
    });
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
            <div className="register-box">
                <h3 className="register-title">Register Akun Baru</h3>
                <p className="register-required">* Wajib di Isi (Required)</p>
                <form onSubmit={handleSubmit} noValidate>
                    {FIELDS.map(field => (
                        <RegisterField
                            key={field.name}
                            label={field.label}
                            type={field.type}
                            name={field.name}
                            value={form[field.name]}
                            autoComplete={field.autoComplete}
                            onChange={handleChange}
                        />
                    ))}
                    <div className="captcha-wrapper">
                        {/* TODO: pasang reCAPTCHA key dari Google */}
                        {/* <ReCAPTCHA sitekey="YOUR_SITE_KEY" /> */}
                        <p style={{ fontSize: "0.8em", color: "#888" }}>[reCAPTCHA here]</p>
                    </div>
                    <div>
                        <RegisterButton isLoading={isLoading} />
                    </div>
                </form>
            </div>
        </div>
    );
}
