import type { Metadata } from "next";
import Login from "@/pages/Login/Login";

export const metadata: Metadata = {
    title: "Login",
    description: "Masuk ke akun pendaftaran Universitas Internasional Batam.",
};

export default function LoginPage() {
    return <Login />;
}
