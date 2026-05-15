// frontend/src/pages/InfoUmum/InfoDetails/student-assistance.tsx

import styles from "../InfoDetail.module.scss";

export const toc = [
  {
    id: "student-assistance-indonesia",
    label: "Bahasa Indonesia",
  },
  {
    id: "student-assistance-english",
    label: "English Version",
  },
];

export default function StudentAssistance() {
  return (
    <>
      {/* INDONESIA */}
      <section id="student-assistance-indonesia">
        <h2>
          Layanan Bantuan
          Mahasiswa Baru
        </h2>

        <p>
          Calon mahasiswa baru yang
          berasal dari luar daerah
          Batam akan difasilitasi
          penjemputan, pengantaran,
          dan persiapan tempat
          tinggal di Kota Batam.
        </p>

        <p>
          Penjemputan mahasiswa baru
          dilakukan pada saat
          kedatangan calon mahasiswa
          di Bandara/Pelabuhan menuju
          kampus UIB.
        </p>

        <p>
          Kemudian akan difasilitasi
          pengantaran untuk
          berbelanja keperluan
          akomodasi, hingga menuju
          tempat tinggal di asrama
          UIB ataupun kos terdekat
          dari kampus UIB.
        </p>

        <p>
          Fasilitas layanan
          mahasiswa baru ini berlaku
          untuk seluruh calon
          mahasiswa UIB yang
          berminat ataupun
          bersedia.
        </p>

        <p>
          Mahasiswa juga tetap akan
          didampingi oleh staf Humas
          demi kenyamanan dan
          keselamatan siswa.
        </p>
      </section>

      {/* LANGUAGE DIVIDER */}
      <div className={styles.langDivider}>
        <span className={styles.langLabel}>
          English Version
        </span>
      </div>

      {/* ENGLISH */}
      <section id="student-assistance-english">
        <h2>
          Student Assistance Service
        </h2>

        <p>
          Prospective new students
          who come from outside the
          Batam area will be
          facilitated in pick-up,
          delivery, and preparation
          for a place to live in
          the city of Batam.
        </p>

        <p>
          The picking up process is
          carried out when
          prospective students
          arrive at the
          airport/port to the UIB
          campus.
        </p>

        <p>
          After that, they will be
          facilitated with delivery
          to shop for accommodation
          needs, to the residence
          in the UIB dormitory or
          the nearest boarding
          house from the UIB
          campus.
        </p>

        <p>
          This new student service
          facility applies to all
          prospective UIB students
          who are interested or
          willing.
        </p>

        <p>
          The student will still be
          accompanied by Public
          Relations staff for the
          convenience and safety of
          students.
        </p>

        <div className={styles.callout}>
          <strong>Contact:</strong>

          <p>
            For new students from
            outside Batam to get
            this benefit, please
            contact{" "}
            <a href="mailto:humas@uib.ac.id">
              humas@uib.ac.id
            </a>
            .
          </p>
        </div>
      </section>
    </>
  );
}