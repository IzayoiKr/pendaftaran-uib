import { useState, useRef, forwardRef, useImperativeHandle } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Turnstile } from "@marsidev/react-turnstile";
import type { TurnstileInstance } from "@marsidev/react-turnstile";
import type { Form } from "../../types";
import { register } from "../../constants/data";
import { api } from "../../api";
import { RightArrowIcon } from "../../components/Icons";
import styles from "./RegisterPage.module.scss";

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string;

interface RegisterTurnstileProps {
    onTokenChange: (token: string | null) => void;
}

interface TurnstileHandle {
    reset: () => void;
}

function RegisterField({ label, type, name, value, autoComplete, minLength, maxLength, onChange }: Form) {
    return (
        <>
            <label htmlFor={name}>{label}</label>
            <input
                id={name}
                type={type}
                name={name}
                value={value}
                autoComplete={autoComplete}
                minLength={minLength}
                maxLength={maxLength}
                onChange={onChange}
                required
            />
        </>
    );
}

const RegisterTurnstile = forwardRef<TurnstileHandle, RegisterTurnstileProps>(
    ({ onTokenChange }, ref) => {
        const turnstileRef = useRef<TurnstileInstance>(null);

        useImperativeHandle(ref, () => ({
            reset: () => {
                turnstileRef.current?.reset();
            }
        }))

        return (
            <div className={styles.turnstile}>
                <Turnstile
                    ref={turnstileRef}
                    siteKey={SITE_KEY}
                    onSuccess={(token) => onTokenChange(token)}
                    onExpire={() => onTokenChange(null)}
                    onError={() => {
                        onTokenChange(null);
                        toast.error("Verifikasi CAPTCHA gagal, coba muat ulang halaman");
                    }}
                    options={{ theme: "light", language: "id" }}
                />
            </div>
        )
    }
);

function RegisterAction() {
    return (
        <>
            <button type="submit" className={styles.registerBtn}>
                Daftar (Register) <RightArrowIcon />
            </button>
            <p className={styles.backLogin}>
                Sudah memiliki akun?{" "}
                <Link to="/login">Login</Link>
            </p>
        </>
    );
}

export default function RegisterPage() {
    const navigate = useNavigate();
    const turnstileRef = useRef<TurnstileHandle>(null);
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        fullName: "",
        nik: "",
        email: "",
        password: "",
        retypePassword: ""
    })

    const handleChange = (name: string, value: string) => {
        const cleanValue = name === "nik" ? value.replace(/\D/g, "") : value;
        setFormData(prev => ({ ...prev, [name]: cleanValue }));
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!turnstileToken) {
            toast.error("Verifikasi CAPTCHA belum selesai, coba lagi");
            turnstileRef.current?.reset();
            return;
        }
        const { fullName, nik, email, password, retypePassword } = formData;

        if (nik.length != 16 || !/^\d+$/.test(nik)) {
            toast.error("NIK harus 16 digit angka");
            return;
        }
        if (password !== retypePassword) {
            toast.error("Password dan konfirmasi password tidak cocok");
            return;
        }

        try {
            await api.auth.register({
                full_name: fullName,
                nik,
                email,
                password,
                cf_turnstile_token: turnstileToken
            });
            
            toast.success("Registrasi berhasil! Silahkan login kembali.")
            navigate("/login");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
            turnstileRef.current?.reset();
            setTurnstileToken(null);
        }
    };

    return (
        <section className={styles.register}>
            <div className={styles.container}>
                <h1>Register Akun Baru</h1>
                <p>* Wajib di Isi (Required)</p>
                <form onSubmit={handleSubmit} noValidate>
                    {register.map((props) => (
                        <RegisterField
                            key={props.name}
                            {...props}
                            value={formData[props.name as keyof typeof formData]}
                            onChange={(e) => handleChange(props.name, e.target.value)}
                        />
                    ))}
                    <RegisterTurnstile
                        ref={turnstileRef}
                        onTokenChange={setTurnstileToken}
                    />
                    <RegisterAction />
                </form>
            </div>
        </section>
    );
}
