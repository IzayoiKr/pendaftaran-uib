import type { Metadata } from "next";
import Prodi from "@/pages/Prodi/Prodi";

export const metadata: Metadata = {
    title: "Program Studi",
    description: "Daftar request perubahan program studi.",
};

export default function ProdiPage() {
    return <Prodi />;
}
