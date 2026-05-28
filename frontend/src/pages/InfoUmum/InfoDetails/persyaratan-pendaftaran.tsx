// frontend/src/pages/InfoUmum/InfoDetails/persyaratan-pendaftaran.tsx
import styles from "../InfoDetail.module.scss";

export const toc = [
    {
        id: "persyaratan-regular",
        label: "Jalur Reguler",
    },
    {
        id: "persyaratan-beasiswa",
        label: "Jalur Beasiswa",
    },
    {
        id: "persyaratan-transfer",
        label: "Mahasiswa Transfer",
    },
    {
        id: "persyaratan-luar-negeri",
        label: "Lulusan Luar Negeri",
    },
];

export default function PersyaratanPendaftaran() {
    return (
        <>
            {/* INDONESIA */}
            <section id="persyaratan-pendaftaran">
                <h2>
                    Persyaratan Pendaftaran Mahasiswa Baru Program Sarjana TA
                    2024/2025
                </h2>

                {/* REGULER */}
                <section id="persyaratan-regular">
                    <h3>
                        Persyaratan Pendaftaran Mahasiswa Baru Jalur Reguler
                    </h3>

                    <p>
                        Persyaratan atau ketentuan melakukan pendaftaran Calon
                        Mahasiswa Baru adalah sebagai berikut:
                    </p>

                    <ol>
                        <li>Mengisi formulir pendaftaran;</li>

                        <li>
                            Salinan Kartu Keluarga dan Kartu Identitas
                            (KTP/Kartu Pelajar/Paspor), di-scan dalam bentuk PDF
                            maksimal 2 MB.
                        </li>

                        <li>
                            Foto soft copy ukuran 2×3, background biru dan
                            mengenakan kemeja putih;
                        </li>

                        <li>
                            Membayar biaya pendaftaran sebesar:
                            <ul>
                                <li>Rp 250.000,- untuk Jalur Reguler</li>

                                <li>Rp 150.000,- untuk Jalur Beasiswa</li>
                            </ul>
                            <p>
                                Khusus pendaftaran Jalur Beasiswa, persyaratan
                                lengkap dapat dilihat pada menu Beasiswa.
                            </p>
                        </li>

                        <li>
                            Semua dokumen di atas dilengkapi pada saat mendaftar
                            pada gelombang yang dibuka di akun pendaftaran.
                        </li>
                    </ol>
                </section>

                {/* BEASISWA */}
                <section id="persyaratan-beasiswa">
                    <h3>
                        Persyaratan Pendaftaran Mahasiswa Baru Jalur Beasiswa
                    </h3>

                    <ol>
                        <li>Warga Negara Indonesia;</li>

                        <li>Usia maksimal 21 tahun;</li>

                        <li>Lulus SMA/SMK/MA/Sederajat tahun 2022 dan 2023;</li>

                        <li>Menempuh jenjang S-1 (Sarjana);</li>

                        <li>
                            Softcopy scan Kartu Keluarga dalam format PDF
                            maksimal 2 MB;
                        </li>

                        <li>
                            Softcopy scan KTP/Kartu Pelajar/Paspor dalam format
                            PDF maksimal 2 MB;
                        </li>

                        <li>
                            Pas foto softcopy background biru ukuran 2×3 dalam
                            format PDF maksimal 2 MB;
                        </li>

                        <li>
                            Mengisi nilai rata-rata rapor dari semester 1 sampai
                            semester 4;
                        </li>

                        <li>
                            Mengisi formulir pendaftaran di gelombang
                            pendaftaran beasiswa.
                        </li>
                    </ol>
                </section>

                {/* TRANSFER */}
                <section id="persyaratan-transfer">
                    <h3>Persyaratan Pendaftaran Sebagai Mahasiswa Transfer</h3>

                    <p>
                        Berikut ini ketentuan pendaftaran sebagai mahasiswa
                        transfer di Universitas Internasional Batam:
                    </p>

                    <ol>
                        <li>
                            Mengumpulkan Transkrip Nilai dari pendidikan
                            sebelumnya.
                            <p>Dokumen dikirim melalui email:</p>
                            <ul>
                                <li>humas@uib.ac.id</li>

                                <li>CC: humas.uib@gmail.com</li>
                            </ul>
                            <p>Sertakan:</p>
                            <ul>
                                <li>Nama lengkap</li>

                                <li>Nomor handphone yang bisa dihubungi</li>

                                <li>Program studi yang dituju</li>
                            </ul>
                        </li>

                        <li>
                            Pihak universitas akan melakukan penyetaraan
                            Transkrip Nilai ke program studi yang dipilih;
                        </li>

                        <li>
                            Form penyetaraan yang sudah ditandatangani Wakil
                            Rektor I akan diserahkan ke pendaftar melalui email,
                            kemudian melanjutkan proses pendaftaran dan Ujian
                            Saringan Masuk UIB.
                        </li>
                    </ol>
                </section>

                {/* LUAR NEGERI */}
                <section id="persyaratan-luar-negeri">
                    <h3>
                        Persyaratan Pendaftaran Mahasiswa Lulusan Luar Negeri
                        (SMA atau Diploma)
                    </h3>

                    <p>
                        Dokumen Ijazah Diploma dan Sarjana (S1) yang berasal
                        dari luar negeri wajib disetarakan di KEMENRISTEKDIKTI
                        Jakarta.
                    </p>

                    <p>
                        Sedangkan Ijazah SMA wajib disetarakan di Kemendikbud
                        Jakarta.
                    </p>

                    <p>
                        Pendaftar juga dapat melampirkan Ijazah dan SKHU Paket C
                        yang sudah terbit.
                    </p>

                    <p>
                        Dokumen dikirimkan melalui email:
                        <strong> humas@uib.ac.id</strong>
                    </p>

                    <div className={styles.callout}>
                        <strong>Catatan:</strong>

                        <p>
                            Proses penyetaraan dilakukan secara online di
                            website lembaga terkait.
                        </p>
                    </div>
                </section>
            </section>

            {/* LANGUAGE DIVIDER */}
            <div className={styles.langDivider}>
                <span className={styles.langLabel}>English Version</span>
            </div>

            {/* ENGLISH */}
            <section id="requirements-registration">
                <h2>
                    New Undergraduate Student Registration Requirements Academic
                    Year 2024/2025
                </h2>

                {/* REGULAR */}
                <section id="requirements-regular">
                    <h3>Regular Line New Student Registration Requirements</h3>

                    <p>
                        The terms or conditions for registering New Student
                        Candidates are as follows:
                    </p>

                    <ol>
                        <li>Fill out the registration form;</li>

                        <li>
                            Copy of birth certificate, family card, and identity
                            card (KTP/Student Card/Passport), scanned in PDF
                            format with maximum size of 2 MB;
                        </li>

                        <li>
                            Softcopy of 2×3 size photographs, blue background
                            and wearing a white shirt;
                        </li>

                        <li>
                            Paying a registration fee of:
                            <ul>
                                <li>IDR 250,000 for Regular Admission</li>

                                <li>IDR 150,000 for Scholarship Admission</li>
                            </ul>
                            <p>
                                For registration through the Scholarship Path,
                                complete requirements can be seen on the
                                Scholarship menu.
                            </p>
                        </li>

                        <li>
                            All the above documents are completed at the time of
                            registering on the available registration batch in
                            the registration account.
                        </li>
                    </ol>
                </section>

                {/* SCHOLARSHIP */}
                <section id="requirements-scholarship">
                    <h3>New Student Admission Requirements for Scholarship</h3>

                    <p>
                        The terms or conditions for registering New Student
                        Candidates are as follows:
                    </p>

                    <ol>
                        <li>Indonesian citizens;</li>

                        <li>
                            Graduated from SMA/SMK/MA/equivalent in 2022 and
                            2023;
                        </li>

                        <li>Maximum age of 21 years;</li>

                        <li>Registering in the S-1 (Bachelor) level;</li>

                        <li>
                            Softcopy of Family Card in PDF format with maximum
                            size of 2 MB;
                        </li>

                        <li>
                            Softcopy of KTP/Student Card/Passport in PDF format
                            with maximum size of 2 MB;
                        </li>

                        <li>
                            2×3 blue background photograph in PDF format with
                            maximum size of 2 MB;
                        </li>

                        <li>
                            Fill in the average value of the report card from
                            semester 1 to semester 4;
                        </li>

                        <li>
                            Fill out the registration form in the scholarship
                            registration batch.
                        </li>
                    </ol>
                </section>

                {/* TRANSFER */}
                <section id="requirements-transfer">
                    <h3>Registration Requirements as a Transfer Student</h3>

                    <p>
                        The following are the conditions for registration as a
                        transfer student at Universitas Internasional Batam:
                    </p>

                    <ol>
                        <li>
                            Submitting transcripts of grades from previous
                            education.
                            <p>Sent via email:</p>
                            <ul>
                                <li>humas@uib.ac.id</li>

                                <li>CC: humas.uib@gmail.com</li>
                            </ul>
                            <p>Include:</p>
                            <ul>
                                <li>Full name</li>

                                <li>Contact phone number</li>

                                <li>Destination study program</li>
                            </ul>
                        </li>

                        <li>
                            The university will equalize the academic transcript
                            to the selected study program;
                        </li>

                        <li>
                            The equalization form that has been signed by the
                            Vice Rector I will be submitted to the registrant
                            through email and then continue the registration
                            process and the UIB Entrance Examination.
                        </li>
                    </ol>
                </section>

                {/* OVERSEAS */}
                <section id="requirements-overseas">
                    <h3>
                        Registration Requirements for Overseas Graduates (High
                        School or Diploma)
                    </h3>

                    <p>
                        Diploma and Bachelor Degree (S1) documents originating
                        from abroad must be equalized at KEMENRISTEKDIKTI
                        Jakarta.
                    </p>

                    <p>
                        High school diplomas must be equalized at the Ministry
                        of Education and Culture Jakarta.
                    </p>

                    <p>
                        Registrants can also attach certificates and SKHU Paket
                        C which have already been issued.
                    </p>

                    <p>
                        Documents should be sent via email:
                        <strong> humas@uib.ac.id</strong>
                    </p>

                    <div className={styles.callout}>
                        <strong>Note:</strong>

                        <p>
                            The equalization process is carried out online on
                            the website of the relevant institution.
                        </p>
                    </div>
                </section>
            </section>
        </>
    );
}
