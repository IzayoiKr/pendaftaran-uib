import type { Metadata } from "next";
import ChangePassword from "@/pages/ChangePassword/ChangePassword";

export const metadata: Metadata = {
    title: "Ubah Password",
    description: "Ubah password akun pendaftaran Universitas Internasional Batam.",
};

export default function ChangePasswordPage() {
    return <ChangePassword />;
}
