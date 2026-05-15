import type { Metadata } from "next";
import Panduan from "@/pages/Panduan/Panduan";

export const metadata: Metadata = {
  title: "Panduan Admisi | Universitas Internasional Batam",
  description:
    "Panduan lengkap proses penerimaan mahasiswa baru Universitas Internasional Batam.",
};

export default function PanduanPage() {
  return <Panduan />;
}
