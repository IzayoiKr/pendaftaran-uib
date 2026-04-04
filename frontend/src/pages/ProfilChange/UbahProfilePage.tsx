import { useState, type ChangeEvent, type FormEvent } from "react";
import "./UbahProfilePage.scss";

interface ProfileForm {
    namaLengkap: string;
    nik:         string;
    email:       string;
}

// Field config — editable: true = bisa diubah, false = readonly
const FIELDS: {
    name:        keyof ProfileForm;
    placeholder: string;
    type:        "text" | "email";
    autoComplete: string;
    editable:    boolean;
}[] = [
    { name: "namaLengkap", placeholder: "Nama Lengkap (Fullname) *", type: "text",  autoComplete: "name",  editable: true  },
    { name: "nik",         placeholder: "Nomor NIK",                 type: "text",  autoComplete: "off",   editable: false },
    { name: "email",       placeholder: "Alamat Email",              type: "email", autoComplete: "email", editable: false },
];

function ProfileInput({ name, placeholder, type, autoComplete, value, editable, onChange }: {
    name:         keyof ProfileForm;
    placeholder:  string;
    type:         "text" | "email";
    autoComplete: string;
    value:        string;
    editable:     boolean;
    onChange:     (e: ChangeEvent<HTMLInputElement>) => void;
}) {
    return (
        <input
            type={type}
            name={name}
            className="single-input"
            placeholder={editable ? placeholder : undefined}
            value={value}
            autoComplete={autoComplete}
            onChange={onChange}
            readOnly={!editable}
            required={editable}
        />
    );
}

function SubmitButton({ isLoading }: { isLoading: boolean }) {
    return (
        <button type="submit" className="submit-btn" disabled={isLoading} aria-busy={isLoading}>
            {isLoading
                ? <><div className="spinner" aria-hidden="true" /> Menyimpan...</>
                : <>Ubah Profile &#8594;</>
            }
        </button>
    );
}

export default function UbahProfilePage() {
    // TODO: isi nilai awal dari backend / auth context
    const [form, setForm] = useState<ProfileForm>({
        namaLengkap: "",
        nik:         "",  // TODO: pre-fill dari backend
        email:       "",  // TODO: pre-fill dari backend
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        // Hanya update field yang editable
        if (FIELDS.find(f => f.name === name)?.editable) {
            setForm(prev => ({ ...prev, [name]: value }));
        }
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
            <div className="ubah-profile-box">
                <h3 className="page-title">Ubah Profile Akun (Change Account Profile)</h3>
                <p className="page-required">* Wajib di Isi (Required)</p>
                <form onSubmit={handleSubmit} noValidate>
                    {FIELDS.map(f => (
                        <ProfileInput
                            key={f.name}
                            name={f.name}
                            placeholder={f.placeholder}
                            type={f.type}
                            autoComplete={f.autoComplete}
                            value={form[f.name]}
                            editable={f.editable}
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
