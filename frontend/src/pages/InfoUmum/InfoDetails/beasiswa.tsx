// frontend/src/pages/InfoUmum/InfoDetails/beasiswa.tsx
import styles from "../InfoDetail.module.scss";

export const toc = [
    {
        id: "beasiswa-cemerlang",
        label: "Cemerlang",
    },
    {
        id: "beasiswa-insan-mandiri",
        label: "Insan Mandiri",
    },
    {
        id: "beasiswa-prestasi-1",
        label: "Prestasi 1",
    },
    {
        id: "beasiswa-prestasi-2",
        label: "Prestasi 2",
    },
    {
        id: "beasiswa-prestasi-3",
        label: "Prestasi 3",
    },
    {
        id: "beasiswa-prestasi-4",
        label: "Prestasi 4",
    },
];

export default function Beasiswa() {
    return (
        <>
            {/* INDONESIA */}
            <section id="beasiswa-indonesia">
                <h2>Program Beasiswa UIB</h2>

                {/* CEMERLANG */}
                <section id="beasiswa-cemerlang">
                    <h3>Beasiswa Cemerlang</h3>

                    <h4>Syarat Khusus</h4>

                    <ul>
                        <li>Nilai rata-rata rapor minimal 80.0;</li>

                        <li>Nilai USM (Ujian Saringan Masuk) ≥ 80;</li>

                        <li>
                            Memiliki prestasi akademik dan/atau non-akademik
                            minimal tingkat provinsi;
                        </li>
                    </ul>

                    <h4>Fasilitas Beasiswa</h4>

                    <ul>
                        <li>100% potongan (gratis) Uang SPP/Uang Gedung;</li>

                        <li>
                            100% potongan (gratis) Biaya Kuliah (BPP Pokok dan
                            SKS);
                        </li>

                        <li>
                            100% potongan (gratis) Biaya Laboratorium (khusus
                            S-1 Pariwisata gratis 50%);
                        </li>
                    </ul>
                </section>

                {/* INSAN MANDIRI */}
                <section id="beasiswa-insan-mandiri">
                    <h3>Beasiswa Insan Mandiri</h3>

                    <h4>Syarat Khusus</h4>

                    <ul>
                        <li>Nilai rata-rata rapor minimal 75.0;</li>

                        <li>Nilai USM (Ujian Saringan Masuk) ≥ 65;</li>

                        <li>
                            Berasal dari keluarga tidak mampu dibuktikan dengan
                            Surat Keterangan Tidak Mampu (SKTM) atau Kartu
                            Indonesia Pintar (KIP);
                        </li>
                    </ul>

                    <h4>Fasilitas Beasiswa</h4>

                    <ul>
                        <li>100% potongan (gratis) Uang SPP/Uang Gedung;</li>

                        <li>
                            100% potongan (gratis) Biaya Kuliah (BPP Pokok dan
                            SKS);
                        </li>

                        <li>
                            100% potongan (gratis) Biaya Laboratorium (khusus
                            S-1 Pariwisata gratis 50%);
                        </li>
                    </ul>
                </section>

                {/* PRESTASI 1 */}
                <section id="beasiswa-prestasi-1">
                    <h3>Beasiswa Prestasi 1</h3>

                    <h4>Syarat Khusus</h4>

                    <ul>
                        <li>Nilai rata-rata rapor minimal 80.0;</li>

                        <li>Nilai USM (Ujian Saringan Masuk) ≥ 80;</li>
                    </ul>

                    <h4>Fasilitas Beasiswa</h4>

                    <ul>
                        <li>100% potongan (gratis) Uang SPP/Uang Gedung;</li>

                        <li>
                            50% potongan Biaya Kuliah (BPP Pokok dan SKS) hingga
                            6 semester;
                        </li>
                    </ul>
                </section>

                {/* PRESTASI 2 */}
                <section id="beasiswa-prestasi-2">
                    <h3>Beasiswa Prestasi 2</h3>

                    <h4>Syarat Khusus</h4>

                    <ul>
                        <li>Nilai rata-rata rapor minimal 75.0;</li>

                        <li>Nilai USM (Ujian Saringan Masuk) ≥ 70;</li>
                    </ul>

                    <h4>Fasilitas Beasiswa</h4>

                    <ul>
                        <li>100% potongan (gratis) Uang SPP/Uang Gedung;</li>

                        <li>
                            25% potongan Biaya Kuliah (BPP Pokok dan SKS) hingga
                            6 semester;
                        </li>
                    </ul>
                </section>

                {/* PRESTASI 3 */}
                <section id="beasiswa-prestasi-3">
                    <h3>Beasiswa Prestasi 3</h3>

                    <h4>Syarat Khusus</h4>

                    <ul>
                        <li>Nilai rata-rata rapor minimal 75.0;</li>

                        <li>Nilai USM (Ujian Saringan Masuk) ≥ 60;</li>
                    </ul>

                    <h4>Fasilitas Beasiswa</h4>

                    <ul>
                        <li>100% potongan (gratis) Uang SPP/Uang Gedung;</li>
                    </ul>
                </section>

                {/* PRESTASI 4 */}
                <section id="beasiswa-prestasi-4">
                    <h3>Beasiswa Prestasi 4</h3>

                    <h4>Syarat Khusus</h4>

                    <ul>
                        <li>Nilai rata-rata rapor minimal 70.0;</li>

                        <li>Nilai USM (Ujian Saringan Masuk) ≥ 50;</li>
                    </ul>

                    <h4>Fasilitas Beasiswa</h4>

                    <ul>
                        <li>75% potongan Uang SPP/Uang Gedung;</li>
                    </ul>
                </section>
            </section>

            {/* LANGUAGE DIVIDER */}
            <div className={styles.langDivider}>
                <span className={styles.langLabel}>English Version</span>
            </div>

            {/* ENGLISH */}
            <section id="beasiswa-english">
                <h2>UIB Scholarship</h2>

                {/* CEMERLANG */}
                <section id="cemerlang-scholarship">
                    <h3>Cemerlang Scholarship</h3>

                    <h4>Special Requirements</h4>

                    <ul>
                        <li>
                            High school report has an average score of 80.0;
                        </li>

                        <li>Admission test scores above or equal to 80;</li>

                        <li>
                            Have academic and/or non-academic achievements at
                            least at the province level;
                        </li>
                    </ul>

                    <h4>Scholarship Advantages</h4>

                    <ul>
                        <li>100% discount (free) Admission Fee;</li>

                        <li>
                            100% discount (free) Tuition Fees (Main Tuition and
                            Courses Fee);
                        </li>

                        <li>
                            100% discount (free) Laboratory fees, (Special for
                            S-1 Tourism 50% Free).
                        </li>
                    </ul>
                </section>

                {/* INSAN MANDIRI */}
                <section id="insan-mandiri-scholarship">
                    <h3>Insan Mandiri Scholarship</h3>

                    <h4>Special Requirements</h4>

                    <ul>
                        <li>
                            The average grade of semester report is at least 50;
                        </li>

                        <li>Admission test scores above 65;</li>

                        <li>
                            Comes from economically disadvantaged family proven
                            by economically disadvantages statement letter or
                            KIP;
                        </li>
                    </ul>

                    <h4>Scholarship Advantages</h4>

                    <ul>
                        <li>100% discount (free) Admission Fee;</li>

                        <li>
                            100% discount (free) Tuition Fees (Main Tuition and
                            Courses Fee);
                        </li>

                        <li>
                            100% discount (free) Laboratory fees, (Special for
                            S-1 Tourism 50% Free).
                        </li>
                    </ul>
                </section>

                {/* PRESTASI 1 */}
                <section id="prestasi-1-scholarship">
                    <h3>Prestasi 1 Scholarship</h3>

                    <h4>Special Requirements</h4>

                    <ul>
                        <li>
                            High school report has an average score of 80.0;
                        </li>

                        <li>Admission test score above or equal to 80;</li>
                    </ul>

                    <h4>Scholarship Advantages</h4>

                    <ul>
                        <li>100% discount (free) Admission Fee;</li>

                        <li>
                            50% discount on Tuition Fees (Main Tuition and
                            Courses Fee) for up to 6 semesters.
                        </li>
                    </ul>
                </section>

                {/* PRESTASI 2 */}
                <section id="prestasi-2-scholarship">
                    <h3>Prestasi 2 Scholarship</h3>

                    <h4>Special Requirements</h4>

                    <ul>
                        <li>
                            High school report has an average score of 75.0;
                        </li>

                        <li>Admission test scores above or equal to 70;</li>
                    </ul>

                    <h4>Scholarship Advantages</h4>

                    <ul>
                        <li>100% discount (free) Admission Fee;</li>

                        <li>
                            25% discount on Tuition Fees (Main Tuition and
                            Courses Fee) for up to 6 semesters.
                        </li>
                    </ul>
                </section>

                {/* PRESTASI 3 */}
                <section id="prestasi-3-scholarship">
                    <h3>Prestasi 3 Scholarship</h3>

                    <h4>Special Requirements</h4>

                    <ul>
                        <li>
                            High school report has an average score of 75.0;
                        </li>

                        <li>Admission test scores above or equal to 60;</li>
                    </ul>

                    <h4>Scholarship Advantages</h4>

                    <ul>
                        <li>100% discount (free) admission fee.</li>
                    </ul>
                </section>

                {/* PRESTASI 4 */}
                <section id="prestasi-4-scholarship">
                    <h3>Prestasi 4 Scholarship</h3>

                    <h4>Special Requirements</h4>

                    <ul>
                        <li>
                            High school report has an average score of 70.0;
                        </li>

                        <li>Admission test scores above or equal to 50;</li>
                    </ul>

                    <h4>Scholarship Advantages</h4>

                    <ul>
                        <li>75% discount on tuition admission fees.</li>
                    </ul>
                </section>
            </section>
        </>
    );
}
