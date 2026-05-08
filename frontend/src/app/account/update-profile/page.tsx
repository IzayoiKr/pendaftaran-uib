import type { Metadata } from "next";
import UpdateProfile from "@/pages/UpdateProfile/UpdateProfile";

export const metadata: Metadata = {
    title: "Ubah Profil",
    description: "Perbarui informasi profil akun pendaftaran Anda.",
};

export default function UpdateProfilePage() {
    return <UpdateProfile />;
}
