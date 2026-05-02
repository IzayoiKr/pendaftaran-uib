'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/api';
import { MailEnvelopeIcon } from '@/components/Icons/Icons';
import styles from './CheckInbox.module.scss';

export default function CheckInbox() {
    const searchParams = useSearchParams();
    const email = searchParams?.get('email') ?? '';
    const from = searchParams?.get('from');
    const didAutoResend = useRef(false);

    const [resendStatus, setResendStatus] = useState<'idle' | 'loading' | 'sent'>(
        () => {
            if (from === 'resend') return 'sent';
            if (from === 'login' && email) return 'loading';
            return 'idle';
        }
    );

    useEffect(() => {
        if (from !== 'login' || !email) return;
        if (didAutoResend.current) return;

        didAutoResend.current = true;
        api.auth.resendVerification(email)
            .then(() => setResendStatus('sent'))
            .catch(() => setResendStatus('idle'));
    }, [email, from]);

    const handleManualResend = async () => {
        if (!email || resendStatus === 'loading') return;
        setResendStatus('loading');
        try {
            await api.auth.resendVerification(email);
            setResendStatus('sent');
        } catch {
            setResendStatus('idle');
        }
    };

    return (
        <main className={styles.checkInbox}>
            <div className={styles.container}>
                <MailEnvelopeIcon />

                <h1 className={styles.heading}>Verifikasi Alamat Email Anda</h1>

                <p className={styles.body}>
                    {email
                        ? <>Kami telah mengirimkan email verifikasi ke{' '}
                            <strong>{email}</strong>. Silakan klik tautan di dalam email tersebut untuk mengaktifkan akun Anda.</>
                        : 'Silakan klik tautan di dalam email verifikasi yang telah kami kirimkan untuk mengaktifkan akun Anda.'}
                </p>

                {resendStatus === 'sent' && (
                    <p className={styles.sentMsg}>
                        Link verifikasi telah dikirim. Periksa inbox atau folder spam Anda.
                    </p>
                )}

                {resendStatus !== 'sent' && (
                    <>
                        <button
                            onClick={handleManualResend}
                            disabled={resendStatus === 'loading' || !email}
                            className={styles.resendBtn}
                        >
                            Kirim Ulang Email Verifikasi
                        </button>
                        <p className={styles.resendNote}>
                            Tidak menerima email? Periksa folder spam, atau klik tombol di atas.
                        </p>
                    </>
                )}

                <Link href="/login" className={styles.loginLink}>
                    Kembali ke Login
                </Link>
            </div>
        </main>
    );
}
