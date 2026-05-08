import type { Metadata } from "next";
import ForgotPassword from "@/pages/ForgotPassword/ForgotPassword";

export const metadata: Metadata = {
    title: "Lupa Password",
    description: "Pulihkan akses ke akun pendaftaran Universitas Internasional Batam.",
};

export default function ForgotPasswordPage() {
    return <ForgotPassword />
}
