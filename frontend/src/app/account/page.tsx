import type { Metadata } from 'next';
import Account from '@/pages/Account/Account';

export const metadata: Metadata = {
    title: "Akun Saya",
    description: "Kelola akun pendaftaran Anda di Universitas Internasional Batam.",
};

export default function AccountPage() {
    return <Account />;
}
