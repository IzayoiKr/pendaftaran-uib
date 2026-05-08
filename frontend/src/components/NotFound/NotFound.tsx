import Link from "next/link";
import styles from "./NotFound.module.scss";

export default function NotFound() {
    return (
        <main>
            <div className={styles.container}>
                <h1>404 - Halaman Tidak Ditemukan</h1>
                <p>Halaman yang dicari tidak tersedia.</p>
                <Link href="/">Kembali ke Beranda</Link>
            </div>
        </main>
    )
}
