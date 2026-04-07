import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Form } from "../../types";
import { register } from "../../constants/data";
import { api, saveSession } from "../../api";
import { RightArrowIcon } from "../../components/Icons";
import styles from "./RegisterPage.module.scss";

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
        const { fullName, nik, email, password, retypePassword } = formData;

        if (nik.length != 16 || !/^\d+$/.test(nik)) {
            return;
        if (password !== retypePassword) {
            return;
        try {
            const res = await api.auth.register({ full_name: fullName, nik, email, password })
            saveSession(res);
            toast.success("Registrasi berhasil! Silahkan login kembali.")
            navigate("/login");
        } catch (err) {
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
                    <RegisterAction />
                </form>
            </div>
        </section>
    );
}
