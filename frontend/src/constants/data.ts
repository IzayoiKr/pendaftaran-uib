import type { Hero, Feature, Guide, Form, BlogPost } from "@/types";

export const heroes: Hero = {
    title: "WELCOME TO UNIVERSITAS INTERNASIONAL BATAM",
    description: "University with international quality standard that produces graduates, science, technology and arts that can meet global dynamic changes.",
    registrationButtonDesc: "PENDAFTARAN (REGISTRATION)",
    academicButtonDesc: "AKADEMIK (ACADEMIC)"

}

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

export const blogPosts: BlogPost[] = [
    {
        id: 10,
        title: 'Video Tutorial Pendaftaran Online Bagi Calon Mahasiswa Universitas Internasional Batam',
        description: 'Untuk panduan pendaftaran online, calon peserta dapat mengakses video di bawah ini. For online registration guidelines, potential participants can access the video below.',
        image: '/images/blog/10.jpg',
        author: 'HUMAS UIB',
        date: '04 Apr, 2020',
        category: 'Universitas Internasional Batam',
        detailLink: '/home/detail_informasi/10',
    },
    {
        id: 11,
        title: 'About Batam',
        description: 'Kota Batam adalah salah satu pulau di Provinsi Kepulauan Riau, yang terletak antara Selat Malaka dan Singapura yang secara keseluruhan membentuk wilayah Batam.',
        image: '/images/blog/11.jpg',
        author: 'HUMAS UIB',
        date: '03 Apr, 2020',
        category: 'Universitas Internasional Batam',
        detailLink: '/home/detail_informasi/11',
    },
    {
        id: 6,
        title: 'UIB Scholarship',
        description: 'Universitas Internasional Batam memberikan fasilitas beasiswa kepada calon mahasiswa baru sebesar 10 Miliar setiap tahunnya. Beasiswa yang diberikan terdiri dari dua macam yaitu beasiswa penuh dan beasiswa parsial (sebagian).',
        image: '/images/blog/6.jpg',
        author: 'HUMAS UIB',
        date: '02 Apr, 2020',
        category: 'Universitas Internasional Batam',
        detailLink: '/home/detail_informasi/6',
    },
    {
        id: 7,
        title: 'Student Assistance Service',
        description: 'Universitas Internasional Batam menyediakan beberapa fasilitas layanan bagi calon mahasiswa yang akan mendaftar ulang dan hadir di UIB.',
        image: '/images/blog/7.jpg',
        author: 'HUMAS UIB',
        date: '02 Apr, 2020',
        category: 'Universitas Internasional Batam',
        detailLink: '/home/detail_informasi/7',
    },
    {
        id: 5,
        title: 'Ujian Saringan Masuk Mahasiswa Baru Program Sarjana',
        description: 'Persyaratan peserta ujian saringan masuk untuk calon mahasiswa UIB.',
        image: '/images/blog/5.jpg',
        author: 'HUMAS UIB',
        date: '22 Dec, 2019',
        category: 'Universitas Internasional Batam',
        detailLink: '/home/detail_informasi/5',
    },
    {
        id: 4,
        title: 'Persyaratan Pendaftaran Mahasiswa Baru Program Sarjana TA 2024/2025',
        description: 'Pendaftaran Calon Mahasiswa Baru Program Sarjana Universitas Internasional Batam terdiri dari Jalur/Gelombang Beasiswa dan Reguler.',
        image: '/images/blog/4.jpg',
        author: 'HUMAS UIB',
        date: '15 Dec, 2019',
        category: 'Universitas Internasional Batam',
        detailLink: '/home/detail_informasi/4',
    },
    {
        id: 3,
        title: 'Informasi Biaya Kuliah Mahasiswa Baru Program Sarjana TA 2024/2025',
        description: 'Biaya Kuliah Calon Mahasiswa Baru TA 2024/2025 terbagi atas Gelombang Beasiswa dan Reguler.',
        image: '/images/blog/3.jpg',
        author: 'HUMAS UIB',
        date: '14 Dec, 2019',
        category: 'Universitas Internasional Batam',
        detailLink: '/home/detail_informasi/3',
    },
    {
        id: 2,
        title: 'Komposisi Soal Ujian Saringan Masuk Mahasiswa Baru Program Sarjana',
        description: 'Komposisi Ujian Saringan Masuk bagi seluruh peserta yang mendaftar sebagai mahasiswa baru program Sarjana adalah sama dan dilaksanakan secara bersamaan, dengan total 100 soal yang terdiri dari:',
        image: '/images/blog/2.jpg',
        author: 'HUMAS UIB',
        date: '01 Dec, 2019',
        category: 'Universitas Internasional Batam',
        detailLink: '/home/detail_informasi/2',
    },
    {
        id: 1,
        title: 'Informasi Tempat Tinggal Terdekat Mahasiswa Universitas Internasional Batam',
        description: 'Informasi Asrama UIB',
        image: '/images/blog/1.jpg',
        author: 'HUMAS UIB',
        date: '01 Nov, 2019',
        category: 'Universitas Internasional Batam',
        detailLink: '/home/detail_informasi/1',
    },
];
