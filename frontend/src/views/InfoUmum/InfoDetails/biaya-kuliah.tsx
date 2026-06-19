// frontend/src/pages/InfoUmum/InfoDetails/biaya-kuliah.tsx
import styles from "../InfoDetail.module.scss";

export const toc = [
    {
        id: "ringkasan-biaya",
        label: "Ringkasan Biaya",
    },
    {
        id: "tabel-biaya-gedung",
        label: "Biaya Gedung",
    },
    {
        id: "estimasi-biaya-semester-1",
        label: "Semester 1",
    },
    {
        id: "estimasi-biaya-beasiswa",
        label: "Program Beasiswa",
    },
    {
        id: "estimasi-biaya-8-semester",
        label: "Estimasi 8 Semester",
    },
];

export default function BiayaKuliah() {
    return (
        <section id="informasi-biaya-kuliah">
            <h2>
                Informasi Biaya Kuliah Mahasiswa Baru Program Sarjana TA
                2024/2025
            </h2>

            {/* RINGKASAN */}
            <section id="ringkasan-biaya">
                <h3>Ringkasan Biaya Kuliah UIB</h3>

                <p>Biaya perkuliahan untuk mahasiswa UIB terdiri dari:</p>

                <ol>
                    <li>
                        Biaya mahasiswa baru. Biaya ini dibayarkan sekali saja
                        ketika pendaftaran ulang. Biaya mahasiswa baru terdiri
                        dari uang gedung (SPP) dan biaya PPL.
                    </li>

                    <li>
                        Biaya mahasiswa aktif (biaya per semester). Biaya ini
                        dibayarkan setiap semester sebagai biaya perkuliahan.
                        Biaya per semester terdiri dari BPP Pokok, biaya SKS,
                        dan biaya laboratorium (jika ada).
                    </li>
                </ol>

                <div className={styles.tableWrap}>
                    <table>
                        <thead>
                            <tr>
                                <th>Detail Biaya</th>
                                <th>Jumlah Biaya</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr>
                                <td>
                                    <strong>A. Biaya Mahasiswa Baru</strong>

                                    <ol>
                                        <li>Uang Gedung</li>
                                        <li>Biaya Administrasi</li>
                                    </ol>
                                </td>

                                <td>
                                    Rp 10.500.000,-
                                    <br />
                                    Rp 3.000.000,-
                                </td>
                            </tr>

                            <tr>
                                <td>
                                    <strong>B. Biaya Per Semester</strong>

                                    <ol>
                                        <li>BPP Pokok</li>

                                        <li>
                                            Biaya SKS (21 SKS × Rp 175.000,-)
                                        </li>

                                        <li>Biaya Laboratorium</li>
                                    </ol>
                                </td>

                                <td>
                                    Rp 5.500.000,-
                                    <br />
                                    Rp 3.675.000,-
                                    <br />
                                    Rp 750.000,-
                                </td>
                            </tr>

                            <tr>
                                <td>
                                    <strong>Total</strong>
                                </td>

                                <td>
                                    <strong>Rp 23.425.000,-</strong>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* BIAYA GEDUNG */}
            <section id="tabel-biaya-gedung">
                <h3>Tabel Biaya Gedung (SPP)</h3>

                <p>
                    Biaya gedung atau biaya SPP akan berbeda-beda sesuai dengan
                    gelombang pendaftaran yang didaftarkan. Selain dari
                    gelombang, biaya gedung (SPP) juga dipengaruhi oleh
                    peringkat USM.
                </p>

                <p>
                    Peringkat USM merupakan pengelompokkan nilai hasil ujian
                    saringan masuk.
                </p>

                <div className={styles.tableWrap}>
                    <table>
                        <thead>
                            <tr>
                                <th>Periode</th>
                                <th>Peringkat I</th>
                                <th>Peringkat II</th>
                                <th>Peringkat III</th>
                                <th>Peringkat IV</th>
                                <th>Peringkat V</th>
                            </tr>
                        </thead>

                        <tbody>
                            {[
                                [
                                    "Gelombang 1",
                                    "5.000.000",
                                    "5.000.000",
                                    "5.000.000",
                                    "5.000.000",
                                    "5.000.000",
                                ],
                                [
                                    "Gelombang 2",
                                    "5.000.000",
                                    "5.000.000",
                                    "5.000.000",
                                    "5.000.000",
                                    "5.000.000",
                                ],
                                [
                                    "Gelombang 3",
                                    "5.000.000",
                                    "5.000.000",
                                    "5.000.000",
                                    "5.000.000",
                                    "5.000.000",
                                ],
                                [
                                    "Gelombang 4",
                                    "5.500.000",
                                    "6.000.000",
                                    "6.500.000",
                                    "7.000.000",
                                    "7.500.000",
                                ],
                                [
                                    "Gelombang 5",
                                    "6.000.000",
                                    "6.500.000",
                                    "7.000.000",
                                    "7.500.000",
                                    "8.000.000",
                                ],
                            ].map((row) => (
                                <tr key={row[0]}>
                                    {row.map((cell) => (
                                        <td key={cell}>Rp {cell},-</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* SEMESTER 1 */}
            <section id="estimasi-biaya-semester-1">
                <h3>Estimasi Biaya Kuliah Semester 1</h3>

                <p>
                    Estimasi biaya perkuliahan UIB untuk semester 1 adalah
                    sebagai berikut:
                </p>

                <div className={styles.tableWrap}>
                    <table>
                        <thead>
                            <tr>
                                <th>Program Studi</th>
                                <th>SPP</th>
                                <th>PPL</th>
                                <th>BPP</th>
                                <th>SKS</th>
                                <th>Total</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr>
                                <td>Teknik Sipil</td>
                                <td>Rp 10.500.000,-</td>
                                <td>Rp 3.000.000,-</td>
                                <td>Rp 5.500.000,-</td>
                                <td>Rp 3.500.000,-</td>
                                <td>Rp 22.500.000,-</td>
                            </tr>

                            <tr>
                                <td>Arsitektur</td>
                                <td>Rp 10.500.000,-</td>
                                <td>Rp 3.000.000,-</td>
                                <td>Rp 5.500.000,-</td>
                                <td>Rp 3.325.000,-</td>
                                <td>Rp 22.325.000,-</td>
                            </tr>

                            <tr>
                                <td>Sistem Informasi</td>
                                <td>Rp 10.500.000,-</td>
                                <td>Rp 3.000.000,-</td>
                                <td>Rp 5.500.000,-</td>
                                <td>Rp 3.325.000,-</td>
                                <td>Rp 22.325.000,-</td>
                            </tr>

                            <tr>
                                <td>Teknologi Informasi</td>
                                <td>Rp 10.500.000,-</td>
                                <td>Rp 3.000.000,-</td>
                                <td>Rp 5.500.000,-</td>
                                <td>Rp 3.325.000,-</td>
                                <td>Rp 22.325.000,-</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className={styles.callout}>
                    <strong>Catatan:</strong>

                    <ol>
                        <li>
                            Semester 1 belum terdapat kelas laboratorium
                            sehingga biaya laboratorium belum tertagih.
                        </li>

                        <li>
                            Biaya PPL Program Studi Pariwisata terdapat tambahan
                            Rp 2.000.000,- karena biaya seragam tambahan.
                        </li>
                    </ol>
                </div>
            </section>

            {/* BEASISWA */}
            <section id="estimasi-biaya-beasiswa">
                <h3>Estimasi Biaya Kuliah Program Beasiswa</h3>

                <p>
                    Penerima beasiswa UIB akan mendapatkan potongan biaya kuliah
                    sesuai dengan beasiswa yang diterima.
                </p>

                <div className={styles.tableWrap}>
                    <table>
                        <thead>
                            <tr>
                                <th>Program</th>
                                <th>Total Estimasi</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr>
                                <td>Cemerlang</td>
                                <td>Rp 3.000.000,-</td>
                            </tr>

                            <tr>
                                <td>Bidikmisi</td>
                                <td>Gratis</td>
                            </tr>

                            <tr>
                                <td>Insan Mandiri</td>
                                <td>Rp 3.000.000,-</td>
                            </tr>

                            <tr>
                                <td>Prestasi 1</td>
                                <td>Rp 7.500.000,-</td>
                            </tr>

                            <tr>
                                <td>Prestasi 2</td>
                                <td>Rp 9.750.000,-</td>
                            </tr>

                            <tr>
                                <td>Prestasi 3</td>
                                <td>Rp 12.000.000,-</td>
                            </tr>

                            <tr>
                                <td>Prestasi 4</td>
                                <td>Rp 14.500.000,-</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* 8 SEMESTER */}
            <section id="estimasi-biaya-8-semester">
                <h3>Estimasi Biaya Kuliah 8 Semester</h3>

                <p>
                    Berikut estimasi total biaya kuliah selama 8 semester di
                    UIB:
                </p>

                <div className={styles.tableWrap}>
                    <table>
                        <thead>
                            <tr>
                                <th>Komponen</th>
                                <th>Total</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr>
                                <td>BPP Pokok</td>
                                <td>Rp 5.500.000,-</td>
                            </tr>

                            <tr>
                                <td>SKS (20 × Rp 175.000,-)</td>

                                <td>Rp 3.500.000,-</td>
                            </tr>

                            <tr>
                                <td>Laboratorium</td>

                                <td>Rp 750.000,-</td>
                            </tr>

                            <tr>
                                <td>Estimasi per semester</td>

                                <td>Rp 9.750.000,-</td>
                            </tr>

                            <tr>
                                <td>Estimasi total 8 semester</td>

                                <td>Rp 78.500.000,-</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </section>
    );
}
