import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, saveSession } from "../../api";
import { RightArrowIcon } from "../../components/Icons";
import styles from "./LoginPage.module.scss";

interface LoginPlaceholderProps {
    type: string;
    placeholder: string;
    autoComplete: string;
    minLength?: number;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface LoginFormProps {
    onLogin: (email: string, password: string) => Promise<void>;
}

interface LoginActionProps {
    error: string | null;
}

function LoginPlaceholder({ type, placeholder, autoComplete, minLength, value, onChange }: LoginPlaceholderProps) {
    return (
        <>
            <input
                id={type}
                name={type}
                type={type}
                placeholder={placeholder}
                autoComplete={autoComplete}
                minLength={minLength}
                value={value}
                onChange={onChange}
                required
            />
        </>
    )
}

function LoginAction({ error }: LoginActionProps) {
    return (
        <>
            {error && <p className={styles.errorText} role="alert">{error}</p>}

            <Link to="/forgot" className={styles.forgotLink}>Lupa Password?</Link>

            <button type="submit" className={styles.loginBtn}>
                Login <RightArrowIcon />
            </button>

            <p className={styles.registerText}>
                Belum memiliki akun?{" "}
                <Link to="/register">Buat Akun</Link>
            </p>
        </>
    )
}

function LoginForm({ onLogin }: LoginFormProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        try {
            await onLogin(email, password);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Terjadi kesalahan");
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit} noValidate>
                <LoginPlaceholder
                    type="email"
                    placeholder="Email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(null); }}
                />
                <LoginPlaceholder
                    type="password"
                    placeholder="Password"
                    autoComplete="current-password"
                    minLength={8}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(null); }}
                />
                <LoginAction error={error} />
            </form>

        </>
    )
}

export default function LoginPage() {
    const navigate = useNavigate();

    const handleLogin = async (email: string, password: string) => {
        const res = await api.auth.login(email, password);
        saveSession(res);
        navigate("/");
    }
    return (
        <main id="login" className={styles.login}>
            <div className={styles.container}>
                <h1>LOGIN</h1>
                <LoginForm onLogin={handleLogin} />
            </div>
        </main>
    );
}
