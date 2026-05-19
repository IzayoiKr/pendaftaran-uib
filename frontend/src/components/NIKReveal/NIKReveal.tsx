'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { api } from '@/api';
import { TubeSpinnerIcon } from '@/components/Icons/AnimatedIcons';
import { EyeIcon, EyeOffIcon } from '@/components/Icons/Icons';
import styles from './NIKReveal.module.scss';

const REVEAL_TTL_S = 15;

interface NIKRevealProps {
    masked: string;
    className?: string;
}

export default function NIKReveal({ masked, className }: NIKRevealProps) {
    const [plain, setPlain] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        if (!plain) return;

        const tick = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 1000)

        const timer = setTimeout(() => {
            setPlain(null);
            setCountdown(0);
        }, REVEAL_TTL_S * 1000)

        return () => {
            clearInterval(tick);
            clearTimeout(timer);
        }
    }, [plain])

    useEffect(() => () => setPlain(null), []);

    const toggle = useCallback(async () => {
        if (plain) {
            setPlain(null);
            setCountdown(0);
            return;
        }

        setLoading(true);
        try {
            const { nik } = await api.profile.revealNIK();
            setPlain(nik);
        } catch (err) {
            toast.error(
                err instanceof Error ? err.message : 'Gagal menampilkan NIK',
            );
        } finally {
            setLoading(false);
        }
    }, [plain]);

    const displayed = plain ?? masked;
    const isRevealed = plain !== null;

    return (
        <span className={`${styles.box} ${className || ''}`}>
            <span
                className={styles.value}
                data-revealed={isRevealed}
                aria-live="polite"
                aria-atomic="true"
            >
                {displayed}
            </span>

            <button
                type="button"
                onClick={toggle}
                disabled={loading}
                aria-label={isRevealed ? 'Sembunyikan NIK' : 'Tampilkan NIK'}
                title={isRevealed ? 'Sembunyikan NIK' : 'Tampilkan NIK'}
                className={styles.btn}
            >
                {loading ? <TubeSpinnerIcon /> : isRevealed ? <EyeOffIcon /> : <EyeIcon />}
            </button>
        </span>
    );
}
