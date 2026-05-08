import type { Metadata } from "next";
import TransferProof from "@/pages/TransferProof/TransferProof";

export const metadata: Metadata = {
    title: "Bukti Transfer",
    description: "Daftar bukti transfer pembayaran pendaftaran.",
};

export default function TransferProofPage() {
    return <TransferProof />;
}
