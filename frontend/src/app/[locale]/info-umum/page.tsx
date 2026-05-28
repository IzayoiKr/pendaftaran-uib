import type { Metadata } from "next";
import InfoUmum from "@/pages/InfoUmum/InfoUmum";

export const metadata: Metadata = {
    title: "Informasi Umum",
    description:
        "Informasi umum mengenai pendaftaran dan kehidupan kampus di Universitas Internasional Batam.",
};

export default function InfoUmumPage() {
    return <InfoUmum />;
}
