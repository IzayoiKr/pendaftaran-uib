import type { Metadata } from "next";
import PrasyaratOspek from "@/pages/PrasyaratOspek/PrasyaratOspek";

export const metadata: Metadata = {
    title: "Prasyarat Ospek",
    description: "Upload dokumen prasyarat ospek.",
};

export default function PrasyaratOspekPage() {
    return <PrasyaratOspek />;
}
