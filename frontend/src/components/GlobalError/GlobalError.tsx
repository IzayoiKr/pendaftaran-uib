import Link from "next/link";
import styles from "./GlobalError.module.scss";

interface GlobalErrorProps {
    reset: () => void;
    type: 'globalError' | 'error';
}

export default function GlobalError({ reset, type }: GlobalErrorProps) {
    return (
        <main>
            <div className={`${styles.container} ${styles[type]}`}>
                <h1>Terjadi Kesalahan</h1>
                <p>Terjadi kesalahan yang tidak terduga. Silakan muat ulang halaman dan coba lagi.</p>
                <button onClick={reset}>
                    Muat Ulang
                </button>
                <Link href="/">Kembali ke Beranda</Link>
            </div>
        </main>
    )
}
