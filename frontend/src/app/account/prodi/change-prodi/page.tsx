import type { Metadata } from "next";
import ChangeProdi from "@/pages/ChangeProdi/ChangeProdi";

export const metadata: Metadata = {
    title: "Request Perpindahan Prodi",
    description: "Ajukan permohonan perpindahan program studi.",
};

export default function ProdiRequestPage() {
    return <ChangeProdi />;
}
