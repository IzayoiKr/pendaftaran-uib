'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/api';
import { CrossmarkIcon } from '../Icons/AnimatedIcons';
import styles from './ExpiredLink.module.scss';

interface ExpiredLinkProps {
    type: 'verify-email' | 'reset-password';
}

function VerifyExpiredAction() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading'>('idle');

    const handleResend = async () => {
        if (!email.trim()) return;
        setStatus('loading');
        try {
            await api.auth.resendVerification(email.trim());
        } catch { }
        router.push(`/check-inbox?email=${encodeURIComponent(email.trim())}&from=resend`);
    };

    return (
        <div className={styles.resendForm}>
            <label htmlFor="expired-email">
                Masukkan email Anda untuk menerima link baru:
            </label>
            <input
                id="expired-email"
                type="email"
                placeholder="contoh@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
            />
            <button
                onClick={handleResend}
                disabled={status === 'loading' || !email.trim()}
                className={styles.btn}
            >
                {status === 'loading' ? 'Mengirim...' : 'Kirim Ulang Link Verifikasi'}
            </button>
        </div>
    );
}

function ResetExpiredAction() {
    return (
        <Link href="/forgot-password" className={styles.backLink}>
            Minta Link Reset Baru
        </Link>
    );
}

export default function ExpiredLink({ type }: ExpiredLinkProps) {
    const isVerify = type === 'verify-email';

    return (
        <div className={styles.container}>
            <CrossmarkIcon />

            <h1 className={styles.heading}>Link Tidak Valid</h1>

            <p className={styles.subheading}>
                {isVerify
                    ? 'Link verifikasi ini sudah tidak berlaku. Silakan minta link verifikasi baru.'
                    : 'Link reset password ini sudah tidak berlaku. Silakan ajukan permintaan baru melalui halaman lupa password.'}
            </p>

            {isVerify ? <VerifyExpiredAction /> : <ResetExpiredAction />}
        </div>
    );
}
