import type { Metadata } from "next";
import CheckInbox from "@/pages/CheckInbox/CheckInbox";

export const metadata: Metadata = {
    title: "Cek Inbox",
    description: "Periksa kotak masuk email pendaftaran Universitas Internasional Batam Anda.",
    robots: {
        index: false,
        follow: false,
    },
};

export default function CheckInboxPage() {
    return <CheckInbox />;
}
