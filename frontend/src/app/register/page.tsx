import type { Metadata } from "next";
import Register from "@/pages/Register/Register";

export const metadata: Metadata = {
    title: "Daftar Akun",
    description: "Buat akun pendaftaran baru Universitas Internasional Batam.",
};

export default function RegisterPage() {
    return <Register />;
}
