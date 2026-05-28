import { infoList } from "@/constants/infoUmum";
import InfoCard from "./InfoCard";
import styles from "./InfoUmum.module.scss";

export default function InfoUmum() {
    return (
        <section className={styles.section}>
            {/* Hero */}
            <div className={styles.hero}>
                <h1 className={styles.heading}>Informasi Umum</h1>
                <p className={styles.sub}>
                    Biaya kuliah, beasiswa, layanan mahasiswa, dan informasi
                    penting lainnya.
                </p>
            </div>

            {/* Grid */}
            {infoList.length > 0 ? (
                <div className={styles.grid}>
                    {infoList.map((post) => (
                        <InfoCard key={post.id} post={post} />
                    ))}
                </div>
            ) : (
                <div className={styles.empty}>
                    <p>Belum ada informasi yang tersedia.</p>
                </div>
            )}
        </section>
    );
}
