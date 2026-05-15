// frontend/src/pages/InfoUmum/InfoDetails/about-batam.tsx

import Image from "next/image";

import styles from "../InfoDetail.module.scss";

export const toc = [
  {
    id: "budaya-bahasa",
    label: "Budaya & Bahasa",
  },
  {
    id: "agama",
    label: "Agama",
  },
  {
    id: "fasilitas-umum",
    label: "Fasilitas Umum",
  },
];

export default function AboutBatam() {
  return (
    <>
      {/* INDONESIA */}
      <section id="about-batam-indonesia">
        <h2>Tentang Kota Batam</h2>

        <p>
          Kota Batam adalah salah satu
          pulau di Provinsi Kepulauan
          Riau, yang terletak antara{" "}
          <strong>Selat Malaka</strong>{" "}
          dan <strong>Singapura</strong>{" "}
          yang secara keseluruhan
          membentuk wilayah Batam.
        </p>

        <p>
          Kota Batam merupakan daerah
          tropis, dengan suhu rata-rata
          berkisar antara{" "}
          <strong>
            24 hingga 35 derajat Celcius
          </strong>{" "}
          (77 sampai 95 derajat
          Fahrenheit).
        </p>

        <p>
          Kelembaban di wilayah ini
          berkisar dari 73% hingga 96%.
          Secara umum musim hujan
          dimulai dari November hingga
          April dan musim kering dari
          Mei hingga Oktober.
        </p>

        <p>
          Rata-rata curah hujan tahunan
          sekitar 2600 mm.
        </p>

        {/* BUDAYA */}
        <section id="budaya-bahasa">
          <h3>Budaya & Bahasa</h3>

          <p>
            Penduduk Kota Batam terdiri
            dari budaya dan etnis yang
            beragam, dan Budaya Melayu
            merupakan budaya yang
            dominan di Kota Batam.
          </p>

          <p>
            Meskipun dalam keragaman
            budaya dan bahasa, Bahasa
            Indonesia sebagai bahasa
            nasional tetap digunakan,
            serta Bahasa Inggris
            diajarkan di sekolah dan
            lebih umum digunakan di
            kalangan bisnis/perusahaan
            multinasional.
          </p>
        </section>

        {/* AGAMA */}
        <section id="agama">
          <h3>Agama</h3>

          <p>
            Enam agama besar yang paling
            banyak dianut di Indonesia,
            yaitu: Agama Islam, Kristen
            (Protestan) dan Katolik,
            Hindu, Buddha, dan
            Konghucu.
          </p>

          <p>
            Meskipun demikian bukan
            berarti agama-agama dan
            kepercayaan lain tidak boleh
            tumbuh dan berkembang di
            Indonesia.
          </p>

          <p>
            Bahkan pemerintah
            berkewajiban mendorong dan
            membantu perkembangan
            agama-agama tersebut.
          </p>

          <p>
            Islam adalah agama mayoritas
            di Kota Batam. Sebagai simbol
            dari masyarakat Kota Batam
            yang menganut beragam agama,
            pemerintah membangun{" "}
            <strong>
              Masjid Raya Batam
            </strong>{" "}
            yang berada di tengah kota
            berdekatan dengan alun-alun.
          </p>

          <p>
            Agama Kristen dan Katolik
            juga dianut oleh masyarakat
            Batam, terutama yang berasal
            dari suku Batak dan Flores.
          </p>

          <p>
            Agama Buddha adalah agama
            yang paling banyak dianut
            oleh warga Tionghoa.
          </p>

          <p>
            Kota Batam memiliki vihara
            yang merupakan vihara
            terbesar di Asia Tenggara,
            yaitu{" "}
            <strong>
              Vihara Duta Maitreya
            </strong>
            .
          </p>
        </section>

        {/* FASILITAS */}
        <section id="fasilitas-umum">
          <h3>Fasilitas Umum</h3>

          <p>
            Kota Batam juga memiliki
            fasilitas umum dan fasilitas
            sosial yang dapat digunakan
            oleh masyarakat seperti:
          </p>

          <div className={styles.imageWrapper}>
            <Image
              src="/images/infoumum/fb.jpg"
              alt="Fasilitas umum dan fasilitas sosial di Kota Batam"
              width={1200}
              height={800}
              className={styles.image}
            />
          </div>

          <p className={styles.source}>
            Sumber:{" "}
            <a
              href="https://bpbatam.go.id/pages/read/414-fasilitas-umum-dan-sosial"
              target="_blank"
              rel="noopener noreferrer"
            >
              bpbatam.go.id/pages/read/414-fasilitas-umum-dan-sosial
            </a>
          </p>
        </section>
      </section>

      {/* LANGUAGE DIVIDER */}
      <div className={styles.langDivider}>
        <span className={styles.langLabel}>
          English Version
        </span>
      </div>

      {/* ENGLISH */}
      <section id="about-batam-english">
        <h2>About Batam</h2>

        <p>
          Batam City is one of the
          islands in the Riau Islands
          Province, which is located
          between the{" "}
          <strong>
            Malacca Strait
          </strong>{" "}
          and <strong>Singapore</strong>{" "}
          which as a whole form the
          Batam region.
        </p>

        <p>
          Batam City is a tropical area,
          with average temperatures
          ranging from{" "}
          <strong>
            24 to 35 degrees Celsius
          </strong>{" "}
          (77 to 95 degrees Fahrenheit).
        </p>

        <p>
          The humidity in this region
          ranges from 73% to 96%.
        </p>

        <p>
          In general, the rainy season
          starts from November to April
          and the dry season from May to
          October.
        </p>

        <p>
          The average annual rainfall is
          around 2600 mm.
        </p>

        {/* CULTURE */}
        <section id="culture-language">
          <h3>Culture & Language</h3>

          <p>
            The population of Batam City
            consists of diverse cultures
            and ethnicities, and Malay
            Culture is the dominant
            culture in the city of
            Batam.
          </p>

          <p>
            Despite the diversity of
            cultures and languages,
            Indonesian as the national
            language is still used, and
            English is taught in schools
            and is more commonly used
            among business/multinational
            companies.
          </p>
        </section>

        {/* RELIGION */}
        <section id="religion">
          <h3>Religion</h3>

          <p>
            The six major religions that
            are most widely practiced in
            Indonesia, namely: Islam,
            Christianity
            (Protestantism) and
            Catholicism, Hinduism,
            Buddhism, and Confucianism.
          </p>

          <p>
            However, this does not mean
            that other religions and
            beliefs cannot grow and
            develop in Indonesia.
          </p>

          <p>
            Even the government is
            obliged to encourage and
            assist the development of
            these religions.
          </p>

          <p>
            Islam is the majority
            religion in Batam City.
          </p>

          <p>
            As a symbol of Batam City
            people who adhere to various
            religions, the government
            built the{" "}
            <strong>
              Batam Grand Mosque
            </strong>{" "}
            which is in the middle of
            the city adjacent to the
            square.
          </p>

          <p>
            Christianity and Catholicism
            are also embraced by the
            people of Batam, especially
            those from the Batak and
            Flores tribes.
          </p>

          <p>
            Buddhism is the religion
            most practiced by Chinese
            citizens.
          </p>

          <p>
            Batam City has a monastery
            which is the largest
            monastery in Southeast Asia,
            namely{" "}
            <strong>
              Vihara Duta Maitreya
            </strong>
            .
          </p>
        </section>

        {/* FACILITIES */}
        <section id="public-facilities">
          <h3>Public Facilities</h3>

          <p>
            Batam City also has public
            facilities and social
            facilities that can be used
            by the community, such as:
          </p>

          <div className={styles.imageWrapper}>
            <Image
              src="/images/infoumum/fb.jpg"
              alt="Public and social facilities in Batam City"
              width={1200}
              height={800}
              className={styles.image}
            />
          </div>

          <p className={styles.source}>
            Source:{" "}
            <a
              href="https://bpbatam.go.id/pages/read/414-fasilitas-umum-dan-sosial"
              target="_blank"
              rel="noopener noreferrer"
            >
              bpbatam.go.id/pages/read/414-fasilitas-umum-dan-sosial
            </a>
          </p>
        </section>
      </section>
    </>
  );
}