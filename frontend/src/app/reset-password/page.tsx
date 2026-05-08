import type { Metadata } from "next";
import ResetPassword from "@/pages/ResetPassword/ResetPassword";

export const metadata: Metadata = {
    title: "Reset Password",
    description: "Atur ulang kata sandi akun pendaftaran Universitas Internasional Batam.",
    robots: {
        index: false,
        follow: false,
    },
};

export default function ResetPasswordPage() {
    return <ResetPassword />;
}
