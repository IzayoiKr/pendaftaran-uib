// frontend/src/pages/InfoUmum/InfoDetails/komposisi-soal.tsx

import styles from "../InfoDetail.module.scss";

export const toc = [
  {
    id: "komposisi-soal-indonesia",
    label: "Bahasa Indonesia",
  },
  {
    id: "komposisi-soal-english",
    label: "English Version",
  },
];

export default function KomposisiSoal() {
  return (
    <>
      {/* INDONESIA */}
      <section id="komposisi-soal-indonesia">
        <h2>
          Komposisi Soal Ujian
          Saringan Masuk Mahasiswa
          Baru Program Sarjana
        </h2>

        <p>
          Komposisi Ujian Saringan
          Masuk bagi seluruh peserta
          yang mendaftar sebagai
          mahasiswa baru program
          Sarjana adalah sama dan
          dilaksanakan secara
          bersamaan.
        </p>

        <p>
          Total ujian terdiri dari{" "}
          <strong>100 soal</strong>{" "}
          yang terbagi menjadi:
        </p>

        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                <th>No.</th>
                <th>Mata Ujian</th>
                <th>Jumlah Soal</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>1</td>
                <td>
                  Bahasa Indonesia
                </td>
                <td>35</td>
              </tr>

              <tr>
                <td>2</td>
                <td>
                  Bahasa Inggris
                </td>
                <td>35</td>
              </tr>

              <tr>
                <td>3</td>
                <td>Matematika</td>
                <td>30</td>
              </tr>

              <tr>
                <td colSpan={2}>
                  <strong>Total</strong>
                </td>

                <td>
                  <strong>100</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* LANGUAGE DIVIDER */}
      <div className={styles.langDivider}>
        <span className={styles.langLabel}>
          English Version
        </span>
      </div>

      {/* ENGLISH */}
      <section id="komposisi-soal-english">
        <h2>
          Entrance Examination
          Question Composition
          for New Undergraduate
          Students
        </h2>

        <p>
          The composition of the
          Entrance Examination for
          all participants who
          register as new students
          of the Undergraduate
          program is the same and
          is carried out
          simultaneously.
        </p>

        <p>
          The examination consists
          of a total of{" "}
          <strong>
            100 questions
          </strong>{" "}
          divided into:
        </p>

        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                <th>No.</th>
                <th>Test Subject</th>
                <th>
                  Total Questions
                </th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>1</td>
                <td>Indonesian</td>
                <td>35</td>
              </tr>

              <tr>
                <td>2</td>
                <td>English</td>
                <td>35</td>
              </tr>

              <tr>
                <td>3</td>
                <td>Mathematics</td>
                <td>30</td>
              </tr>

              <tr>
                <td colSpan={2}>
                  <strong>Total</strong>
                </td>

                <td>
                  <strong>100</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}