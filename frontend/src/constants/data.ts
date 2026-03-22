import { createElement } from "react";
import type { Hero, Program, Event, Feature } from "../types";

const images = import.meta.glob('../assets/courses/*.{jpg,png,jpeg}', {
    eager: true,
    import: 'default'
});
const getImage = (name: string): string => {
    return images[`../assets/courses/${name}`] as string;
};
const eventImages = import.meta.glob('../assets/event/*.{jpg,png,jpeg}', {
    eager: true,
    import: 'default'
}) as Record<string, string>;
const getEventImage = (name: string): string => {
    return eventImages[`../assets/event/${name}`];
};

import { FaUserGraduate, FaBook, FaGlobeAmericas } from 'react-icons/fa';


export const heroes: Hero = {
    title: "WELCOME TO UNIVERSITAS INTERNASIONAL BATAM",
    description: "University with international quality standard that produces graduates, science, technology and arts that can meet global dynamic changes.",
    registrationButtonDesc: "PENDAFTARAN (REGISTRATION)",
    academicButtonDesc: "AKADEMIK (ACADEMIC)"

}

export const programs: Program[] = [
  {
    id: 'ts',
    title: 'Teknik Sipil',
    faculty: 'FTSP',
    degree: 'S1',
    description: 'Sebagai program study yang menghasilkan lulusan berstandar internasional yang berkompeten dalam menerapkan keilmuan dalam pengembangan teknologi di bidang rekayasa sipil serta mampu mengaplikasikan dalam pembangunan berkelanjutan (sustainable development) di wilayah kepulauan untuk menghadapi tuntutan dan perubahan global dunia yang bersifat dinamis.',
    image: getImage('TS.jpg'),
    link: 'https://www.uib.ac.id/ts/',
  },
  {
    id: 'ar',
    title: 'Arsitektur',
    faculty: 'FTSP',
    degree: 'S1',
    description: 'Menjadi program studi arsitektur maritim berbasis kearifan lokal dengan daya saing global yang mendukung pembangunan wilayah pesisir berkelanjutan.',
    image: getImage('AR.jpg'),
    link: 'https://www.uib.ac.id/arsi/',
  },
  {
    id: 'si',
    title: 'Sistem Informasi',
    faculty: 'FIK',
    degree: 'S1',
    description: 'Sebagai program sarjana yang menghasilkan lulusan berkualitas di bidang Sistem Informasi melalui pendidikan, penelitian, dan pengabdian kepada masyarakat, pada tingkat nasional dan internasional di tahun 2021.',
    image: getImage('SI.jpg'),
    link: 'https://www.uib.ac.id/si/',
  },
  {
    id: 'ti',
    title: 'Teknologi Informasi',
    faculty: 'FIK',
    degree: 'S1',
    description: 'Sebagai program sarjana yang menghasilkan lulusan berkualitas dalam bidang teknologi informasi khususnya teknologi cloud dan keamanan melalui pendidikan, penelitian, dan pengabdian masyarakat, pada tingkat nasional dan internasional di tahun 2021.',
    image: getImage('TI.jpg'),
    link: 'https://www.uib.ac.id/ti/',
  },
  {
    id: 'mn',
    title: 'Manajemen',
    faculty: 'FBM',
    degree: 'S1',
    description: 'Sebagai Program Sarjana Manajemen berstandar internasional dalam menghasilkan lulusan yang memiliki jiwa kepemimpinan dan kewirausahaan, berkompeten dalam bidang hubungan industri, keuangan perusahaan, pemasaran business to consumer, serta tanggap dalam mengantisipasi perubahan global yang dinamis.',
    image: getImage('MN.jpg'),
    link: 'https://www.uib.ac.id/mn/',
  },
  {
    id: 'ak',
    title: 'Akuntansi',
    faculty: 'FBM',
    degree: 'S1',
    description: 'Sebagai program studi yang menghasilkan lulusan profesional di bidang akuntansi keuangan sesuai standar internasional dengan jiwa kepemimpinan dan kewirausahaan serta mampu mengikuti perubahan global yang dinamis.',
    image: getImage('AK.jpg'),
    link: 'https://www.uib.ac.id/ak/',
  },
  {
    id: 'pr',
    title: 'Pariwisata',
    faculty: 'FBM',
    degree: 'S1',
    description: 'Menjadi program studi pariwisata dengan standar mutu internasional yang menghasilkan IPTEKS dan lulusan yang mampu mengikuti dinamika perubahan pariwisata di tingkat nasional dan internasional.',
    image: getImage('PR.jpg'),
    link: 'https://www.uib.ac.id/par/',
  },
  {
    id: 'mm',
    title: 'Magister Manajemen',
    faculty: 'FBM',
    degree: 'S2',
    description: 'Sebagai program studi dengan standar kualitas internasional yang menghasilkan lulusan berkualitas dengan kepemimpinan dan kewirausahaan bersemangat dan kompetensi dalam manajemen internasional di tingkat manajerial.',
    image: getImage('MM.jpg'),
    link: 'https://www.uib.ac.id/mm/',
  },
  {
    id: 'ih',
    title: 'Ilmu Hukum',
    faculty: 'FIH',
    degree: 'S1',
    description: 'Sebagai Program Studi dengan standar kualitas internasional yang menghasilkan lulusan hukum yang dapat memenuhi perubahan dinamis hukum bisnis dalam konteks nasional dan internasional.',
    image: getImage('IH.jpg'),
    link: 'https://www.uib.ac.id/ih/',
  },
  {
    id: 'mh',
    title: 'Magister Hukum',
    faculty: 'FIH',
    degree: 'S2',
    description: 'Sebagai program studi dengan standar mutu internasional yang menghasilkan lulusan berkualitas yang mampu mengikuti dinamika perubahan hukum bisnis di tingkat nasional dan internasional.',
    image: getImage('MH.jpg'),
    link: 'https://www.uib.ac.id/mh/',
  },
  {
    id: 'pbi',
    title: 'Pendidikan Bahasa Inggris',
    faculty: 'FIP',
    degree: 'S1',
    description: 'Menjadi program sarjana yang menghasilkan lulusan dengan kompetensi unggul dalam bidang pendidikan bahasa Inggris yang dinamis berbasis Edutechnopreneur (education, technology, and entrepreneurship) sesuai dengan standar kualitas internasional.',
    image: getImage('PBI.jpg'),
    link: 'https://www.uib.ac.id/pbi/',
  },
];


export const events: Event[] = [
    {
        id: 's1-1',
        image: getEventImage('GP.jpg'),
        programType: 'Program Sarjana',
        programTypeEn: 'Undergraduate Program',
        academicYear: 'T.A 2026/2027',
        date: '09 May',
        time: '09:00 - 13:00',
        location: 'Batam',
        batchName: 'Gelombang 2 Beasiswa-S1 Kedokteran',
        registrationStart: '09 Feb 2026',
        registrationEnd: '25 Apr 2026',
        registerLink: '/daftar/...',
    },
    {
        id: 's2-1',
        image: getEventImage('magister.png'),
        programType: 'Program Magister',
        programTypeEn: 'Master Program',
        academicYear: 'T.A 2025/2026',
        date: '07 Mar',
        time: '09:00 - 17:00',
        location: 'Online',
        batchName: 'Gelombang 05',
        registrationStart: '26 Jan 2026',
        registrationEnd: '06 Mar 2026',
        registerLink: '/daftar_s2/...',
    },
    {
        id: 's1-2',
        image: getEventImage('GP.jpg'),
        programType: 'Program Sarjana',
        programTypeEn: 'Undergraduate Program',
        academicYear: 'T.A 2026/2027',
        date: '01 Mar',
        time: '09:00 - 16:00',
        location: 'Online',
        batchName: 'Gelombang 04',
        registrationStart: '12 Jan 2026',
        registrationEnd: '27 Feb 2026',
        registerLink: '/daftar/...',
    },
    {
        id: 's1-3',
        image: getEventImage('beasiswa-baru.png'),
        programType: 'Program Sarjana',
        programTypeEn: 'Undergraduate Program',
        academicYear: 'T.A 2026/2027',
        date: '27 Jun',
        time: '09:00 - 16:00',
        location: 'Online',
        batchName: 'Beasiswa III',
        registrationStart: '08 Dec 2025',
        registrationEnd: '26 Jun 2026',
        registerLink: '/daftar/...',
    },
];

export const features: Feature[] = [
    {
        id: 'scholarship',
        icon: createElement(FaUserGraduate, { size: 36, color: "#4F46E5" }),
        title: 'UIB Scholarship',
        description: 'Universitas Internasional Batam memberikan fasilitas beasiswa kepada calon mahasiswa baru sebesar 10 Miliar setiap tahunnya. Beasiswa yang diberikan terdiri dari dua macam yaitu beasiswa penuh dan beasiswa tidak penuh (sebagian). Beasiswa penuh terdiri dari Beasiswa Cemerlang dan Beasiswa Insan Mandiri dan beasiswa tidak penuh (sebagian) terdiri dari Beasiswa Prestasi 1, 2, 3, dan 4.',
        link: '/home/detail_informasi/6',
    },
    {
        id: 'assistance',
        icon: createElement(FaBook, { size: 36, color: "#4F46E5" }),
        title: 'Student Assistance Service',
        description: 'Universitas Internasional Batam menyediakan beberapa fasilitas layanan bagi calon mahasiswa yang akan mendaftar ulang dan hadir di UIB.',
        link: '/home/detail_informasi/7',
    },
    {
        id: 'batam',
        icon: createElement(FaGlobeAmericas, { size: 36, color: "#4F46E5" }),
        title: 'About Batam',
        description: 'Kota Batam adalah salah satu pulau di Provinsi Kepulauan Riau, yang terletak antara Selat Malaka dan Singapura yang secara keseluruhan membentuk wilayah Batam. Kota Batam merupakan daerah tropis, dengan suhu rata-rata berkisar antara 24 hingga 35 derajat Celcius (77 sampai 95 derajat Fahrenheit). Kelembaban di wilayah ini berkisar dari 73% menjadi 96%. Secara umum musim hujan dimulai dari November hingga April dan musim kering dari Mei hingga Oktober. Rata-rata curah hujan tahunan sekitar 2600 mm.',
        link: '/home/detail_informasi/11',
    },
];

