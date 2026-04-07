import type { Hero, Program, Event, Feature, Guide, Form } from "../types";

const assetImages = import.meta.glob('../assets/**/*.{jpg,png,jpeg,webp,avif}', {
    eager: true,
    import: 'default'
}) as Record<string, string>;

export const getImg = (path: string): string => { return assetImages[`../assets/${path}`] };

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
        image: getImg('courses/TS.jpg'),
        imageWebp: getImg('courses/TS.webp'),
        imageAvif: getImg('courses/TS.avif'),
        link: 'https://www.uib.ac.id/ts/',
    },
    {
        id: 'ar',
        title: 'Arsitektur',
        faculty: 'FTSP',
        degree: 'S1',
        description: 'Menjadi program studi arsitektur maritim berbasis kearifan lokal dengan daya saing global yang mendukung pembangunan wilayah pesisir berkelanjutan.',
        image: getImg('courses/AR.jpg'),
        imageWebp: getImg('courses/AR.webp'),
        imageAvif: getImg('courses/AR.avif'),
        link: 'https://www.uib.ac.id/arsi/',
    },
    {
        id: 'si',
        title: 'Sistem Informasi',
        faculty: 'FIK',
        degree: 'S1',
        description: 'Sebagai program sarjana yang menghasilkan lulusan berkualitas di bidang Sistem Informasi melalui pendidikan, penelitian, dan pengabdian kepada masyarakat, pada tingkat nasional dan internasional di tahun 2021.',
        image: getImg('courses/SI.jpg'),
        imageWebp: getImg('courses/SI.webp'),
        imageAvif: getImg('courses/SI.avif'),
        link: 'https://www.uib.ac.id/si/',
    },
    {
        id: 'ti',
        title: 'Teknologi Informasi',
        faculty: 'FIK',
        degree: 'S1',
        description: 'Sebagai program sarjana yang menghasilkan lulusan berkualitas dalam bidang teknologi informasi khususnya teknologi cloud dan keamanan melalui pendidikan, penelitian, dan pengabdian masyarakat, pada tingkat nasional dan internasional di tahun 2021.',
        image: getImg('courses/TI.jpg'),
        imageWebp: getImg('courses/TI.webp'),
        imageAvif: getImg('courses/TI.avif'),
        link: 'https://www.uib.ac.id/ti/',
    },
    {
        id: 'mn',
        title: 'Manajemen',
        faculty: 'FBM',
        degree: 'S1',
        description: 'Sebagai Program Sarjana Manajemen berstandar internasional dalam menghasilkan lulusan yang memiliki jiwa kepemimpinan dan kewirausahaan, berkompeten dalam bidang hubungan industri, keuangan perusahaan, pemasaran business to consumer, serta tanggap dalam mengantisipasi perubahan global yang dinamis.',
        image: getImg('courses/MN.jpg'),
        imageWebp: getImg('courses/MN.webp'),
        imageAvif: getImg('courses/MN.avif'),
        link: 'https://www.uib.ac.id/mn/',
    },
    {
        id: 'ak',
        title: 'Akuntansi',
        faculty: 'FBM',
        degree: 'S1',
        description: 'Sebagai program studi yang menghasilkan lulusan profesional di bidang akuntansi keuangan sesuai standar internasional dengan jiwa kepemimpinan dan kewirausahaan serta mampu mengikuti perubahan global yang dinamis.',
        image: getImg('courses/AK.jpg'),
        imageWebp: getImg('courses/AK.webp'),
        imageAvif: getImg('courses/AK.avif'),
        link: 'https://www.uib.ac.id/ak/',
    },
    {
        id: 'pr',
        title: 'Pariwisata',
        faculty: 'FBM',
        degree: 'S1',
        description: 'Menjadi program studi pariwisata dengan standar mutu internasional yang menghasilkan IPTEKS dan lulusan yang mampu mengikuti dinamika perubahan pariwisata di tingkat nasional dan internasional.',
        image: getImg('courses/PR.jpg'),
        imageWebp: getImg('courses/PR.webp'),
        imageAvif: getImg('courses/PR.avif'),
        link: 'https://www.uib.ac.id/par/',
    },
    {
        id: 'mm',
        title: 'Magister Manajemen',
        faculty: 'FBM',
        degree: 'S2',
        description: 'Sebagai program studi dengan standar kualitas internasional yang menghasilkan lulusan berkualitas dengan kepemimpinan dan kewirausahaan bersemangat dan kompetensi dalam manajemen internasional di tingkat manajerial.',
        image: getImg('courses/MM.jpg'),
        imageWebp: getImg('courses/MM.webp'),
        imageAvif: getImg('courses/MM.avif'),
        link: 'https://www.uib.ac.id/mm/',
    },
    {
        id: 'ih',
        title: 'Ilmu Hukum',
        faculty: 'FIH',
        degree: 'S1',
        description: 'Sebagai Program Studi dengan standar kualitas internasional yang menghasilkan lulusan hukum yang dapat memenuhi perubahan dinamis hukum bisnis dalam konteks nasional dan internasional.',
        image: getImg('courses/IH.jpg'),
        imageWebp: getImg('courses/IH.webp'),
        imageAvif: getImg('courses/IH.avif'),
        link: 'https://www.uib.ac.id/ih/',
    },
    {
        id: 'mh',
        title: 'Magister Hukum',
        faculty: 'FIH',
        degree: 'S2',
        description: 'Sebagai program studi dengan standar mutu internasional yang menghasilkan lulusan berkualitas yang mampu mengikuti dinamika perubahan hukum bisnis di tingkat nasional dan internasional.',
        image: getImg('courses/MH.jpg'),
        imageWebp: getImg('courses/MH.webp'),
        imageAvif: getImg('courses/MH.avif'),
        link: 'https://www.uib.ac.id/mh/',
    },
    {
        id: 'pbi',
        title: 'Pendidikan Bahasa Inggris',
        faculty: 'FIP',
        degree: 'S1',
        description: 'Menjadi program sarjana yang menghasilkan lulusan dengan kompetensi unggul dalam bidang pendidikan bahasa Inggris yang dinamis berbasis Edutechnopreneur (education, technology, and entrepreneurship) sesuai dengan standar kualitas internasional.',
        image: getImg('courses/PBI.jpg'),
        imageWebp: getImg('courses/PBI.webp'),
        imageAvif: getImg('courses/PBI.avif'),
        link: 'https://www.uib.ac.id/pbi/',
    },
];


export const events: Event[] = [
    {
        id: 's1-1',
        image: getImg('event/GP.jpg'),
        imageWebp: getImg('event/GP.webp'),
        imageAvif: getImg('event/GP.avif'),
        programType: 'Program Sarjana',
        programTypeEn: 'Undergraduate Program',
        academicYear: 'T.A 2026/2027',
        day: '09',
        month: 'May',
        startTime: '09:00',
        endTime: '13:00',
        location: 'Batam',
        batchName: 'Gelombang 2 Beasiswa-S1 Kedokteran',
        registrationStart: '09 Feb 2026',
        registrationEnd: '25 Apr 2026',
        registerLink: '/daftar/...',
    },
    {
        id: 's2-1',
        image: getImg('event/magister.png'),
        imageWebp: getImg('event/magister.webp'),
        imageAvif: getImg('event/magister.avif'),
        programType: 'Program Magister',
        programTypeEn: 'Master Program',
        academicYear: 'T.A 2025/2026',
        day: '07',
        month: 'Mar',
        startTime: '09:00',
        endTime: '17:00',
        location: 'Online',
        batchName: 'Gelombang 05',
        registrationStart: '26 Jan 2026',
        registrationEnd: '06 Mar 2026',
        registerLink: '/daftar_s2/...',
    },
    {
        id: 's1-2',
        image: getImg('event/GP.jpg'),
        imageWebp: getImg('event/GP.webp'),
        imageAvif: getImg('event/GP.avif'),
        programType: 'Program Sarjana',
        programTypeEn: 'Undergraduate Program',
        academicYear: 'T.A 2026/2027',
        day: '01',
        month: 'Mar',
        startTime: '09:00',
        endTime: '16:00',
        location: 'Online',
        batchName: 'Gelombang 04',
        registrationStart: '12 Jan 2026',
        registrationEnd: '27 Feb 2026',
        registerLink: '/daftar/...',
    },
    {
        id: 's1-3',
        image: getImg('event/beasiswa-baru.png'),
        imageWebp: getImg('event/beasiswa-baru.webp'),
        imageAvif: getImg('event/beasiswa-baru.avif'),
        programType: 'Program Sarjana',
        programTypeEn: 'Undergraduate Program',
        academicYear: 'T.A 2026/2027',
        day: '27',
        month: 'Jun',
        startTime: '09:00',
        endTime: '16:00',
        location: 'Online',
        batchName: 'Beasiswa III',
        registrationStart: '08 Dec 2025',
        registrationEnd: '26 Jun 2026',
        registerLink: '/daftar/...',
    },
];

export const features: Feature[] = [
    {
        icon: 'Student',
        title: 'UIB Scholarship',
        description: 'Universitas Internasional Batam memberikan fasilitas beasiswa kepada calon mahasiswa baru sebesar 10 Miliar setiap tahunnya. Beasiswa yang diberikan terdiri dari dua macam yaitu beasiswa penuh dan beasiswa tidak penuh (sebagian). Beasiswa penuh terdiri dari Beasiswa Cemerlang dan Beasiswa Insan Mandiri dan beasiswa tidak penuh (sebagian) terdiri dari Beasiswa Prestasi 1, 2, 3, dan 4. ',
        link: '/detail_informasi/6',
    },
    {
        icon: 'Book',
        title: 'Student Assistance Service',
        description: 'Universitas Internasional Batam menyediakan beberapa fasilitas layanan bagi calon mahasiswa yang akan mendaftar ulang dan hadir di UIB. ',
        link: '/detail_informasi/7',
    },
    {
        icon: 'Earth',
        title: 'About Batam',
        description: 'Kota Batam adalah salah satu pulau di Provinsi Kepulauan Riau, yang terletak antara Selat Malaka dan Singapura yang secara keseluruhan membentuk wilayah Batam. Kota Batam merupakan daerah tropis, dengan suhu rata-rata berkisar antara 24 hingga 35 derajat Celcius (77 sampai 95 derajat Fahrenheit). Kelembaban di wilayah ini berkisar dari 73% menjadi 96%. Secara umum musim hujan dimulai dari November hingga April dan musim kering dari Mei hingga Oktober. Rata-rata curah hujan tahunan sekitar 2600 mm. ',
        link: '/detail_informasi/11',
    },
];

export const guides: Guide[] = [
    {
        id: 'admissions',
        title: 'Student Admissions Guideline',
        description: 'Silahkan ikuti video di bawah ini.',
        embedUrl: 'https://www.youtube.com/embed/E3ez3tOA_D4?vq=hd1080si=KUOZbzZdYxe10y95'
    },
    {
        id: 're-registration',
        title: 'Re-registration Guideline',
        description: 'Silahkan ikuti video di bawah ini.',
        embedUrl: 'https://www.youtube.com/embed/WWaq2Hs6kq0?vq=hd1080si=poy1zeAo5OMuMauu'
    }
]

export const login: Form[] = [
    {
        name: "email",
        type: "email",
        placeholder: "Email",
        autoComplete: "email"
    },
    {
        name: "password",
        type: "password",
        placeholder: "Password",
        autoComplete: "current-password",
        minLength: 8
    }
]

export const register: Form[] = [
    {
        name: "fullName",
        label: "Nama Lengkap (FullName)",
        type: "text",
        autoComplete: "name",
    },
    {
        name: "nik",
        label: "No NIK (National Identification Number)",
        type: "text",
        autoComplete: "off",
        maxLength: 16
    },
    {
        name: "email",
        label: "Email *",
        type: "email",
        autoComplete: "email"
    },
    {
        name: "password",
        label: "Password *",
        type: "password",
        autoComplete: "new-password",
        minLength: 8
    },
    {
        name: "retypePassword",
        label: "Retype Password *",
        type: "password",
        autoComplete: "new-password",
        minLength: 8
    }
]

export const schools: string[] = [
    "SMAN 1 Batam",
    "SMAN 2 Batam",
    "SMAN 3 Batam",
    "SMKN 1 Batam",
    "SMKN 2 Batam",
    "SMK Kartini Batam",
    "SMA Yos Sudarso Batam",
    "SMA Kartini Batam",
    "SMA Methodist Batam",
    "SMA Harapan Utama Batam"
];

export const universities: string[] = [
    "Universitas Indonesia",
    "Universitas Gadjah Mada",
    "Institut Teknologi Bandung",
    "Universitas Airlangga",
    "Universitas Diponegoro",
    "Universitas Brawijaya",
    "Universitas Hasanuddin",
    "Universitas Padjadjaran",
    "Universitas Sebelas Maret",
    "Universitas Sumatera Utara",
    "Universitas Riau",
    "Universitas Maritim Raja Ali Haji",
    "Universitas Internasional Batam",
    "Politeknik Negeri Batam",
    "Universitas Putera Batam",
    "Universitas Batam",
    "Universitas Negeri Jakarta",
    "Universitas Gunadarma",
    "Universitas Bina Nusantara",
    "Universitas Trisakti",
    "Universitas Tarumanagara",
    "Universitas Atma Jaya Jakarta",
    "Universitas Mercu Buana",
    "Universitas Telkom",
    "Universitas Komputer Indonesia",
    "Institut Teknologi Sepuluh Nopember",
    "Universitas Andalas",
    "Universitas Sriwijaya",
    "Universitas Lampung",
    "Universitas Mulawarman",
];
