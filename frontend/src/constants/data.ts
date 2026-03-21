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
        faculty: 'FTI',
        degree: 'S1',
        description: 'Test',
        image: getImage('SI.jpg'),
        link: '',
    },
    {
        id: 'ti',
        title: 'Teknik Informatika',
        faculty: 'FTI',
        degree: 'S1',
        description: '...',
        image: getImage('TI.jpg'),
        link: '',
    },
    {
        id: 'mn',
        title: 'Manajemen',
        faculty: 'FEB',
        degree: 'S1',
        description: '...',
        image: getImage('MN.jpg'),
        link: '',
    },
    {
        id: 'ak',
        title: 'Akuntansi',
        faculty: 'FEB',
        degree: 'S1',
        description: '...',
        image: getImage('AK.jpg'),
        link: '',
    },
    {
        id: 'pr',
        title: 'Ilmu Komunikasi (Public Relations)',
        faculty: 'FIKOM',
        degree: 'S1',
        description: '...',
        image: getImage('PR.jpg'),
        link: '',
    },
    {
        id: 'mm',
        title: 'Manajemen (Magister)',
        faculty: 'Pascasarjana',
        degree: 'S2',
        description: '...',
        image: getImage('MM.jpg'),
        link: '',
    },
    {
        id: 'ih',
        title: 'Ilmu Hukum',
        faculty: 'FH',
        degree: 'S1',
        description: '...',
        image: getImage('IH.jpg'),
        link: '',
    },
    {
        id: 'mh',
        title: 'Magister Hukum',
        faculty: 'Pascasarjana',
        degree: 'S2',
        description: '...',
        image: getImage('MH.jpg'),
        link: '',
    },
    {
        id: 'pbi',
        title: 'Pendidikan Bahasa Inggris',
        faculty: 'FKIP',
        degree: 'S1',
        description: '...',
        image: getImage('PBI.jpg'),
        link: '',
    },
    // ... add all other programs (SI, TI, MN, AK, PR, MM, IH, MH, PBI)
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
        icon: 'flaticon-student',
        title: 'UIB Scholarship',
        description: 'Universitas Internasional Batam memberikan fasilitas beasiswa kepada calon mahasiswa baru sebesar 10 Miliar setiap tahunnya. Beasiswa yang diberikan terdiri dari dua macam yaitu beasiswa penuh dan beasiswa tidak penuh (sebagian). Beasiswa penuh terdiri dari Beasiswa Cemerlang dan Beasiswa Insan Mandiri dan beasiswa tidak penuh (sebagian) terdiri dari Beasiswa Prestasi 1, 2, 3, dan 4.',
        link: '/home/detail_informasi/6',
    },
    {
        id: 'assistance',
        icon: 'flaticon-book',
        title: 'Student Assistance Service',
        description: 'Universitas Internasional Batam menyediakan beberapa fasilitas layanan bagi calon mahasiswa yang akan mendaftar ulang dan hadir di UIB.',
        link: '/home/detail_informasi/7',
    },
    {
        id: 'batam',
        icon: 'flaticon-earth',
        title: 'About Batam',
        description: 'Kota Batam adalah salah satu pulau di Provinsi Kepulauan Riau, yang terletak antara Selat Malaka dan Singapura yang secara keseluruhan membentuk wilayah Batam. Kota Batam merupakan daerah tropis, dengan suhu rata-rata berkisar antara 24 hingga 35 derajat Celcius (77 sampai 95 derajat Fahrenheit). Kelembaban di wilayah ini berkisar dari 73% menjadi 96%. Secara umum musim hujan dimulai dari November hingga April dan musim kering dari Mei hingga Oktober. Rata-rata curah hujan tahunan sekitar 2600 mm.',
        link: '/home/detail_informasi/11',
    },
];

