import styles from "./Loading.module.scss";

export default function Loading() {
    return (
        <main className={styles.loading}>
            <div className={styles.loader} />
        </main>
    );
}
