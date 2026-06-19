import type { Metadata } from "next";
import Panduan from "@/views/Panduan/Panduan";

export const metadata: Metadata = {
    title: "Panduan Admisi",
    description:
        "Panduan lengkap proses penerimaan mahasiswa baru Universitas Internasional Batam.",
};

export default function PanduanPage() {
    return <Panduan />;
}
