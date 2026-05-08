import type { Metadata } from "next";
import NotFound from "@/components/NotFound/NotFound";

export const metadata: Metadata = {
    title: "404 - Halaman Tidak Ditemukan",
};

export default function NotFoundPage() {
    return <NotFound />;
}
