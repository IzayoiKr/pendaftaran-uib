import { useState, type ChangeEvent, type FormEvent } from "react";
import "./UbahPasswordPage.scss";

interface PasswordForm {
    oldPassword:     string;
    newPassword:     string;
    confirmPassword: string;
}

const FIELDS: {
    name:        keyof PasswordForm;
    placeholder: string;
}[] = [
    { name: "oldPassword",     placeholder: "Password Lama (Old Password) *" },
    { name: "newPassword",     placeholder: "Password Baru (New Password) *" },
    { name: "confirmPassword", placeholder: "Konfirmasi Password Baru (Confirm New Password) *" },
];

function PasswordInput({ name, placeholder, value, onChange }: {
    name:        keyof PasswordForm;
    placeholder: string;
    value:       string;
    onChange:    (e: ChangeEvent<HTMLInputElement>) => void;
}) {
    return (
        <input
            type="password"
            name={name}
            className="single-input"
            placeholder={placeholder}
            value={value}
            autoComplete={name === "oldPassword" ? "current-password" : "new-password"}
            onChange={onChange}
            minLength={8}
            required
        />
    );
}

function SubmitButton({ isLoading }: { isLoading: boolean }) {
    return (
        <button type="submit" className="submit-btn" disabled={isLoading} aria-busy={isLoading}>
            {isLoading
                ? <><div className="spinner" aria-hidden="true" /> Menyimpan...</>
                : <>Ubah Password &#8594;</>
            }
        </button>
    );
}

export default function UbahPasswordPage() {
    const [form, setForm] = useState<PasswordForm>({
        oldPassword: "", newPassword: "", confirmPassword: "",
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
            <div className="ubah-password-box">
                <h3 className="page-title">Ubah Password (Change Password)</h3>
                <p className="page-required">* Wajib di Isi (Required)</p>
                <form onSubmit={handleSubmit} noValidate>
                    {FIELDS.map(f => (
                        <PasswordInput
                            key={f.name}
                            name={f.name}
                            placeholder={f.placeholder}
                            value={form[f.name]}
                            onChange={handleChange}
                        />
                    ))}
                    <div>
                        <SubmitButton isLoading={isLoading} />
                    </div>
                </form>
            </div>
        </div>
    );
}
