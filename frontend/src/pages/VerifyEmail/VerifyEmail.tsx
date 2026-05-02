'use client';

import { useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { api, ApiError } from '@/api';
import TurnstileWidget from '@/components/TurnstileWidget';
import type { TurnstileHandle } from '@/components/TurnstileWidget';
import ExpiredLink from '@/components/ExpiredLink';
import { CheckmarkIcon, BouncingBallsIcon } from '../../components/Icons/AnimatedIcons';
import styles from './VerifyEmail.module.scss';

type State = 'pending' | 'loading' | 'success' | 'expired';

export default function VerifyEmail() {
    const searchParams = useSearchParams();
    const token = searchParams?.get('token');

    const [state, setState] = useState<State>('pending');
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
    const turnstileRef = useRef<TurnstileHandle>(null);

    if (!token) {
        return (
            <main className={styles.verifyEmail}>
                <ExpiredLink type="verify-email" />
            </main>
        );
    }

    const handleVerify = async () => {
        if (!turnstileToken) return;

        setState('loading');
        const toastId = toast.loading("Sedang verifikasi...")
        try {
            await api.auth.verifyEmail(token, turnstileToken);
            setState('success');
            toast.dismiss(toastId);
        } catch (err) {
            turnstileRef.current?.reset();
            setTurnstileToken(null);

            const isExpired = err instanceof ApiError && err.expired;
            if (isExpired) {
                setState('expired');
                toast.warning("Link sudah tidak valid, mohon verifikasi ulang", { id: toastId });
            } else {
                setState('pending');
                toast.error(
                    err instanceof Error ? err.message : 'Verifikasi gagal, coba lagi',
                    { id: toastId },
                );
            }
        }
    };

    if (state === 'expired') {
        return (
            <main className={styles.verifyEmail}>
                <ExpiredLink type="verify-email" />
            </main>
        );
    }

    if (state === 'success') {
        return (
            <main className={styles.verifyEmail}>
                <div className={styles.container}>
                    <CheckmarkIcon />
                    <h1 className={styles.heading}>Email Berhasil Diverifikasi!</h1>
                    <p className={styles.body}>
                        Akun Anda telah aktif. Silakan login untuk melanjutkan.
                    </p>
                    <Link href="/login" className={styles.btn}>
                        Login Sekarang
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className={styles.verifyEmail}>
            <div className={styles.container}>
                <BouncingBallsIcon />

                <h1 className={styles.heading}>Hampir Selesai...</h1>
                <p className={styles.body}>
                    Selesaikan verifikasi di bawah lalu klik tombol untuk mengaktifkan akun Anda.
                </p>

                <TurnstileWidget
                    ref={turnstileRef}
                    onTokenChange={setTurnstileToken}
                    className={styles.turnstile}
                />

                <button
                    onClick={handleVerify}
                    disabled={!turnstileToken || state === 'loading'}
                    className={styles.btn}
                    aria-busy={state === 'loading'}
                >
                    {state === 'loading'
                        ? 'Memverifikasi...'
                        : 'Verifikasi & Aktifkan Akun'}
                </button>
            </div>
        </main>
    );
}
