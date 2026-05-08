import type { Metadata } from "next";
import VerifyEmail from "@/pages/VerifyEmail/VerifyEmail";

export const metadata: Metadata = {
    title: "Verifikasi Email",
    description: "Verifikasi alamat email akun pendaftaran Universitas Internasional Batam.",
    robots: {
        index: false,
        follow: false,
    },
};

export default function VerifyEmailPage() {
    return <VerifyEmail />;
}
