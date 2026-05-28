import { panduanList } from "@/constants/panduan";
import GuideCard from "./GuideCard";
import styles from "./Panduan.module.scss";

export default function Panduan() {
    return (
        <section className={styles.section}>
            {/* ── Hero ── */}
            <div className={styles.hero}>
                <h1 className={styles.heading}>
                    Panduan Penerimaan Mahasiswa Baru
                </h1>
                <p className={styles.sub}>
                    Klik kartu untuk mengunduh panduan PDF.
                </p>
            </div>

            {/* ── Cards ── */}
            <div className={styles.grid} role="list">
                {panduanList.map((item) => (
                    <div key={item.id} role="listitem">
                        <GuideCard item={item} />
                    </div>
                ))}
            </div>
        </section>
    );
}
