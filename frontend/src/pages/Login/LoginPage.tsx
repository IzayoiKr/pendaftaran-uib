import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link } from "react-router-dom";
import "./LoginPage.scss";


interface LoginForm {
    email: string;
    password: string;
}


function LoginInput({ type, name, placeholder, value, autoComplete, minLength, onChange }: {
    type: "email" | "password";
    name: keyof LoginForm;
    placeholder: string;
    value: string;
    autoComplete: string;
    minLength?: number;
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
            minLength={minLength}
            onChange={onChange}
            required
        />
    );
}

function LoginButton({ isLoading }: { isLoading: boolean }) {
    return (
        <button type="submit" className="login-btn" disabled={isLoading} aria-busy={isLoading}>
            {isLoading
                ? <><div className="spinner" aria-hidden="true" /> Login</>
                : "Login"
            }
        </button>
    );
}


export default function LoginPage() {
    const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await new Promise(r => setTimeout(r, 1000)); 
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div id="login" className="page-content">
            <div className="login-box">
                <h3 className="login-title">LOGIN</h3>
                <form onSubmit={handleSubmit} noValidate>
                    <LoginInput type="email" name="email" placeholder="Email"
                        value={form.email} autoComplete="email" onChange={handleChange} />
                    <LoginInput type="password" name="password" placeholder="Password"
                        value={form.password} autoComplete="current-password" minLength={8} onChange={handleChange} />
                    <Link to="/forgot"> 
                    Lupa Password? 
                    </Link>
                
                    <div>
                        <LoginButton isLoading={isLoading} />
                    </div>
                    <p className="register-text">
                        Belum memiliki akun?{" "}
                        <Link to="/register">Buat Akun</Link>
                    </p>
                     
                </form>
            </div>
        </div>
    );
}
