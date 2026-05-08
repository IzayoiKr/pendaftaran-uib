import type { Metadata } from "next";
import UploadTransferProof from "@/pages/UploadTransferProof/UploadTransferProof";

export const metadata: Metadata = {
    title: "Upload Bukti Transfer",
    description: "Unggah bukti transfer pembayaran pendaftaran.",
};

export default function UploadTransferProofPage() {
    return <UploadTransferProof />;
}
