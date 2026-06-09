import BantuanMahasiswa from "./BantuanMahasiswa";
import BiayaKuliah from "./BiayaKuliah";
import Beasiswa from "./InfoBeasiswa";
import KomposisiSoal from "./KomposisiSoal";
import PersyaratanPendaftaran from "./PersyaratanPendaftaran";
import TempatTinggal from "./TempatTinggal";
import TentangBatam from "./TentangBatam";
import UjianSaringanMasuk from "./UjianSaringanMasuk";
import VideoTutorial from "./VideoTutorial";

export const infoDetailModules = {
    "about-batam": {
        Content: TentangBatam,
    },

    beasiswa: {
        Content: Beasiswa,
    },

    "biaya-kuliah": {
        Content: BiayaKuliah,
    },

    "komposisi-soal": {
        Content: KomposisiSoal,
    },

    "persyaratan-pendaftaran": {
        Content: PersyaratanPendaftaran,
    },

    "student-assistance": {
        Content: BantuanMahasiswa,
    },

    "tempat-tinggal": {
        Content: TempatTinggal,
    },

    "ujian-saringan-masuk": {
        Content: UjianSaringanMasuk,
    },

    "video-tutorial": {
        Content: VideoTutorial,
    },
};
