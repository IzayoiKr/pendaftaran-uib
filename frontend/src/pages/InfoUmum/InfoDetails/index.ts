import AboutBatam, { toc as aboutBatamToc } from "./about-batam";
import Beasiswa, { toc as beasiswaToc } from "./beasiswa";
import BiayaKuliah, { toc as biayaKuliahToc } from "./biaya-kuliah";
import KomposisiSoal, { toc as komposisiSoalToc } from "./komposisi-soal";
import PersyaratanPendaftaran, {
    toc as persyaratanToc,
} from "./persyaratan-pendaftaran";
import StudentAssistance, {
    toc as studentAssistanceToc,
} from "./student-assistance";
import TempatTinggal, { toc as tempatTinggalToc } from "./tempat-tinggal";
import UjianSaringanMasuk, { toc as ujianToc } from "./ujian-saringan-masuk";
import VideoTutorial, { toc as videoTutorialToc } from "./video-tutorial";

export const infoDetailModules = {
    "about-batam": {
        Content: AboutBatam,
        toc: aboutBatamToc,
    },

    beasiswa: {
        Content: Beasiswa,
        toc: beasiswaToc,
    },

    "biaya-kuliah": {
        Content: BiayaKuliah,
        toc: biayaKuliahToc,
    },

    "komposisi-soal": {
        Content: KomposisiSoal,
        toc: komposisiSoalToc,
    },

    "persyaratan-pendaftaran": {
        Content: PersyaratanPendaftaran,

        toc: persyaratanToc,
    },

    "student-assistance": {
        Content: StudentAssistance,

        toc: studentAssistanceToc,
    },

    "tempat-tinggal": {
        Content: TempatTinggal,

        toc: tempatTinggalToc,
    },

    "ujian-saringan-masuk": {
        Content: UjianSaringanMasuk,

        toc: ujianToc,
    },

    "video-tutorial": {
        Content: VideoTutorial,

        toc: videoTutorialToc,
    },
};
