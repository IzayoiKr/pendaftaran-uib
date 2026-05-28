export interface PanduanItem {
    id: string;
    step: number;
    titleId: string;
    titleEn: string;
    descriptionId: string;
    pdfUrl: string;
    /** Tailwind-style gradient class pairs mapped in GuideCard */
    gradientKey: string;
}

export const panduanList: PanduanItem[] = [
    {
        id: "pembuatan-akun",
        step: 1,
        titleId: "Pembuatan Akun",
        titleEn: "Account Registration",
        descriptionId: "Buat akun untuk memulai proses pendaftaran.",
        pdfUrl: "/docs/panduan/Pembuatan_Akun.pdf",
        gradientKey: "blue",
    },
    {
        id: "pendaftaran",
        step: 2,
        titleId: "Pendaftaran",
        titleEn: "Registration",
        descriptionId: "Isi formulir dan lengkapi data pendaftaran kamu.",
        pdfUrl: "/docs/panduan/Pendaftaran.pdf",
        gradientKey: "purple",
    },
    {
        id: "ubah-biodata",
        step: 3,
        titleId: "Perubahan Biodata",
        titleEn: "Personal Data Update",
        descriptionId:
            "Perbaiki atau perbarui data pribadi setelah pendaftaran.",
        pdfUrl: "/docs/panduan/Ubah_Biodata.pdf",
        gradientKey: "green",
    },
    {
        id: "upload-bukti-transfer",
        step: 4,
        titleId: "Upload Bukti Transfer",
        titleEn: "Upload Transfer Slip",
        descriptionId: "Unggah bukti pembayaran biaya pendaftaran.",
        pdfUrl: "/docs/panduan/Upload_Bukti_Transfer.pdf",
        gradientKey: "orange",
    },
    {
        id: "daftar-ulang",
        step: 5,
        titleId: "Daftar Ulang",
        titleEn: "Re-registration",
        descriptionId:
            "Selesaikan proses daftar ulang setelah dinyatakan lulus.",
        pdfUrl: "/docs/panduan/Daftar_Ulang.pdf",
        gradientKey: "teal",
    },
    {
        id: "syarat-ospek",
        step: 6,
        titleId: "Pengisian Syarat Ospek",
        titleEn: "Orientation Requirements",
        descriptionId:
            "Lengkapi persyaratan untuk mengikuti orientasi mahasiswa baru.",
        pdfUrl: "/docs/panduan/Syarat_Ospek.pdf",
        gradientKey: "pink",
    },
    {
        id: "pindah-prodi",
        step: 7,
        titleId: "Permintaan Pindah Prodi",
        titleEn: "Change Major Request",
        descriptionId: "Ajukan permintaan untuk berpindah program studi.",
        pdfUrl: "/docs/panduan/Permintaan_Pindah_Prodi.pdf",
        gradientKey: "indigo",
    },
];
