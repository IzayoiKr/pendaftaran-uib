import { useState } from "react";
import "./LoginPage.scss";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        await new Promise((r) => setTimeout(r, 1000));
        setIsLoading(false);
    };

    return (
        <div id="login" className="page-content">
            <div className="login-box">
                <h3 className="login-title">LOGIN</h3>
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        className="single-input"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        className="single-input"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        minLength={8}
                        required
                    />
                    <a
                        href="https://pendaftaran.uib.ac.id/akun/lupa_password"
                        className="forgot-link"
                    >
                        Lupa Password?
                    </a>
                    <div>
                        <button type="submit" className="login-btn" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <div className="spinner" />
                                    Login
                                </>
                            ) : (
                                "Login"
                            )}
                        </button>
                    </div>
                    <p className="register-text">
                        Belum memiliki akun ?{" "}
                        <a href="https://pendaftaran.uib.ac.id/akun/register">Buat Akun</a>
                    </p>
                </form>
            </div>
        </div>
    );
}
