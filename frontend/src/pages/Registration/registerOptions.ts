import type { DocConfig, SelectOption } from "./types";
import {
    AGAMA,
    JENIS_DAFTAR,
    JENIS_KELAMIN,
    JENJANG_PENDIDIKAN,
    KEWARGANEGARAAN,
    PEKERJAAN,
    PENDIDIKAN,
    PENGHASILAN,
    STATUS_INSTANSI,
    STATUS_ORANG_TUA,
    SUMBER_BIAYA,
    WAKTU_KULIAH,
} from "./valueOptions";

export const JENIS_KELAMIN_OPTIONS: SelectOption<string>[] = [
    { value: JENIS_KELAMIN.LAKI_LAKI, label: "lakiLaki" },
    { value: JENIS_KELAMIN.PEREMPUAN, label: "perempuan" },
];

export const KEWARGANEGARAAN_OPTIONS: SelectOption<string>[] = [
    { value: KEWARGANEGARAAN.WNI, label: "wni" },
    { value: KEWARGANEGARAAN.WNA, label: "wna" },
    { value: KEWARGANEGARAAN.STATELESS, label: "stateless" },
];

export const JENJANG_PENDIDIKAN_OPTIONS: SelectOption<string>[] = [
    { value: JENJANG_PENDIDIKAN.D3, label: "d3" },
    { value: JENJANG_PENDIDIKAN.D4, label: "d4" },
    { value: JENJANG_PENDIDIKAN.S1, label: "s1" },
    { value: JENJANG_PENDIDIKAN.S2, label: "s2" },
];

export const AGAMA_OPTIONS: SelectOption<string>[] = [
    { value: AGAMA.ISLAM, label: "islam" },
    { value: AGAMA.KATOLIK, label: "katolik" },
    { value: AGAMA.KRISTEN, label: "kristen" },
    { value: AGAMA.HINDU, label: "hindu" },
    { value: AGAMA.BUDDHA, label: "buddha" },
    { value: AGAMA.KONGHUCU, label: "konghucu" },
    { value: AGAMA.NOT_SPECIFIED, label: "notSpecified" },
];

export const SUMBER_BIAYA_OPTIONS: SelectOption<string>[] = [
    { value: SUMBER_BIAYA.SENDIRI, label: "sendiri" },
    { value: SUMBER_BIAYA.INSTANSI, label: "instansi" },
    { value: SUMBER_BIAYA.LAINNYA, label: "lainnya" },
];

export const STATUS_INSTANSI_OPTIONS: SelectOption<string>[] = [
    { value: STATUS_INSTANSI.PEMERINTAH, label: "pemerintah" },
    { value: STATUS_INSTANSI.SWASTA, label: "swasta" },
    { value: STATUS_INSTANSI.BUMN, label: "bumn" },
    { value: STATUS_INSTANSI.PTN, label: "ptn" },
    { value: STATUS_INSTANSI.PTS, label: "pts" },
];

export const JENIS_DAFTAR_OPTIONS: SelectOption<string>[] = [
    { value: JENIS_DAFTAR.BARU, label: "baru" },
    { value: JENIS_DAFTAR.ALIH_JENJANG, label: "alihJenjang" },
    { value: JENIS_DAFTAR.TRANSFER, label: "transfer" },
];

export const WAKTU_KULIAH_OPTIONS: SelectOption<string>[] = [
    { value: WAKTU_KULIAH.PAGI, label: "pagi" },
    { value: WAKTU_KULIAH.MALAM, label: "malam" },
];

export const PENDIDIKAN_OPTIONS: SelectOption<string>[] = [
    { value: PENDIDIKAN.TIDAK_TAMAT_SD, label: "tidakTamatSd" },
    { value: PENDIDIKAN.SD, label: "sd" },
    { value: PENDIDIKAN.SMP, label: "smp" },
    { value: PENDIDIKAN.SMA_SMK, label: "smaSmk" },
    { value: PENDIDIKAN.D1, label: "d1" },
    { value: PENDIDIKAN.D2, label: "d2" },
    { value: PENDIDIKAN.D3, label: "d3" },
    { value: PENDIDIKAN.D4, label: "d4" },
    { value: PENDIDIKAN.S1, label: "s1" },
    { value: PENDIDIKAN.PROFESI, label: "profesi" },
    { value: PENDIDIKAN.SP_1, label: "sp1" },
    { value: PENDIDIKAN.S2, label: "s2" },
    { value: PENDIDIKAN.SP_2, label: "sp2" },
    { value: PENDIDIKAN.S3, label: "s3" },
    { value: PENDIDIKAN.NON_AKADEMIK, label: "nonAkademik" },
    { value: PENDIDIKAN.NOT_SPECIFIED, label: "notSpecified" },
];

export const PEKERJAAN_OPTIONS: SelectOption<string>[] = [
    { value: PEKERJAAN.PNS_ASN, label: "pnsAsn" },
    { value: PEKERJAAN.TNI_POLRI, label: "tniPolri" },
    { value: PEKERJAAN.PENGAJAR, label: "pengajar" },
    { value: PEKERJAAN.SWASTA, label: "karyawanSwasta" },
    { value: PEKERJAAN.BUMN_BUMD, label: "bumnBumd" },
    { value: PEKERJAAN.WIRASWASTA, label: "wiraswasta" },
    { value: PEKERJAAN.PROFESIONAL, label: "profesional" },
    { value: PEKERJAAN.PETANI_NELAYAN, label: "petaniNelayan" },
    { value: PEKERJAAN.BURUH, label: "buruh" },
    { value: PEKERJAAN.IRT, label: "irt" },
    { value: PEKERJAAN.PENSIUNAN, label: "pensiunan" },
    { value: PEKERJAAN.LAINNYA, label: "lainnya" },
    { value: PEKERJAAN.NOT_SPECIFIED, label: "notSpecified" },
];

export const PENGHASILAN_OPTIONS: SelectOption<string>[] = [
    { value: PENGHASILAN.NONE, label: "none" },
    { value: PENGHASILAN.UNDER_500K, label: "under500k" },
    { value: PENGHASILAN.UNDER_1M, label: "under1m" },
    { value: PENGHASILAN.UNDER_2M5, label: "under2m5" },
    { value: PENGHASILAN.UNDER_5M, label: "under5m" },
    { value: PENGHASILAN.UNDER_7M5, label: "under7m5" },
    { value: PENGHASILAN.UNDER_10M, label: "under10m" },
    { value: PENGHASILAN.ABOVE_10M, label: "above10m" },
];

export const STATUS_ORANG_TUA_OPTIONS: SelectOption<string>[] = [
    { value: STATUS_ORANG_TUA.HIDUP, label: "hidup" },
    { value: STATUS_ORANG_TUA.MENINGGAL, label: "meninggal" },
];

const CURRENT_YEAR = new Date().getFullYear();

const SMA_TOTAL_YEAR_RANGE = 25;
export const TAHUN_LULUS_SMA_OPTIONS: SelectOption<string>[] = Array.from(
    { length: SMA_TOTAL_YEAR_RANGE },
    (_, i) => {
        const year = String(CURRENT_YEAR - i);
        return { value: year, label: year };
    },
);

const KERJA_TOTAL_YEAR_RANGE = 45;
export const TAHUN_MULAI_KERJA_OPTIONS: SelectOption<string>[] = Array.from(
    { length: KERJA_TOTAL_YEAR_RANGE },
    (_, i) => {
        const year = String(CURRENT_YEAR - i);
        return { value: year, label: year };
    },
);

export const S1_DOCS: DocConfig[] = [
    {
        name: "pp",
        label: "pasPhoto",
        section: "Personal",
        required: true,
    },
    {
        name: "ktp",
        label: "ktpSimPassport",
        section: "Personal",
        required: true,
    },
    {
        name: "kk",
        label: "kartuKeluarga",
        section: "Personal",
        required: true,
    },
    {
        name: "transkripNilai",
        label: "transkripNilai",
        section: "Study",
        required: true,
        condition: "transferOrAlih",
    },
    {
        name: "ijazahDok",
        label: "ijazah",
        section: "Study",
        required: true,
        condition: "transferOrAlih",
    },
];

export const S1_BEASISWA_DOCS: DocConfig[] = [
    {
        name: "sktmKip",
        label: "sktmKip",
        section: "Personal",
        required: false,
    },
    {
        name: "fotoRumah",
        label: "fotoRumah",
        section: "Personal",
        required: false,
    },
    {
        name: "tagihanListrik",
        label: "tagihanListrik",
        section: "Personal",
        required: false,
    },
    {
        name: "tagihanAir",
        label: "tagihanAir",
        section: "Personal",
        required: false,
    },
    {
        name: "sertifikatPrestasi",
        label: "sertifikatPrestasi",
        section: "Personal",
        required: false,
    },
    {
        name: "rapot1",
        label: "rapot1",
        section: "Study",
        required: false,
    },
    {
        name: "rapot2",
        label: "rapot2",
        section: "Study",
        required: false,
    },
    {
        name: "rapot3",
        label: "rapot3",
        section: "Study",
        required: false,
    },
    {
        name: "rapot4",
        label: "rapot4",
        section: "Study",
        required: false,
    },
];

export const S2_DOCS: DocConfig[] = [
    {
        name: "al",
        label: "aktaLahir",
        section: "Personal",
        required: true,
    },
    {
        name: "kk",
        label: "kartuKeluarga",
        section: "Personal",
        required: true,
    },
    {
        name: "pp",
        label: "pasPhoto",
        section: "Personal",
        required: true,
    },
    {
        name: "ktp",
        label: "ktpSimPassport",
        section: "Personal",
        required: true,
    },
    {
        name: "r1",
        label: "ijazahSarjana",
        section: "Study",
        required: true,
    },
    {
        name: "r2",
        label: "transkripSarjana",
        section: "Study",
        required: true,
    },
];

export const PARENT_SECTIONS = [
    {
        type: "Father" as const,
        title: "labels.fatherTitle",
        fields: {
            nik: "fatherNik",
            nama: "fatherName",
            tgl: "fatherBirthdate",
            telp: "fatherPhone",
            pendidikan: "fatherEducation",
            pekerjaan: "fatherOccupation",
            penghasilan: "fatherIncome",
            stat: "fatherStatus",
        },
        labels: {
            nik: "labels.fatherNik",
            nama: "labels.fatherName",
            tgl: "labels.fatherBirthdate",
            telp: "labels.fatherPhone",
            pendidikan: "labels.fatherEducation",
            pekerjaan: "labels.fatherOccupation",
            penghasilan: "labels.fatherIncome",
            stat: "labels.fatherStatus",
        },
    },
    {
        type: "Mother" as const,
        title: "labels.motherTitle",
        fields: {
            nik: "motherNik",
            nama: "motherName",
            tgl: "motherBirthdate",
            telp: "motherPhone",
            pendidikan: "motherEducation",
            pekerjaan: "motherOccupation",
            penghasilan: "motherIncome",
            stat: "motherStatus",
        },
        labels: {
            nik: "labels.motherNik",
            nama: "labels.motherName",
            tgl: "labels.motherBirthdate",
            telp: "labels.motherPhone",
            pendidikan: "labels.motherEducation",
            pekerjaan: "labels.motherOccupation",
            penghasilan: "labels.motherIncome",
            stat: "labels.motherStatus",
        },
    },
] as const;

export const PARENT_ADDRESS_FIELD = {
    name: "parentsAddress",
    label: "labels.parentsAddress",
    placeholder: "parentsAddressPlaceholder",
    helper: "parentsAddressHelper",
} as const;

export const PARENT_SELECT_FIELDS = [
    {
        fieldKey: "pendidikan",
        options: PENDIDIKAN_OPTIONS,
        placeholder: "educationPlaceholder",
        helper: "educationHelper",
    },
    {
        fieldKey: "pekerjaan",
        options: PEKERJAAN_OPTIONS,
        placeholder: "occupationPlaceholder",
        helper: "occupationHelper",
    },
    {
        fieldKey: "penghasilan",
        options: PENGHASILAN_OPTIONS,
        placeholder: "incomePlaceholder",
        helper: "incomeHelper",
    },
    {
        fieldKey: "stat",
        options: STATUS_ORANG_TUA_OPTIONS,
        placeholder: "statusPlaceholder",
        helper: "statusHelper",
    },
] as const;

export const UPLOAD_CONSTRAINTS = {
    maxSizeBytes: 2 * 1024 * 1024,
    maxSizeLabel: "2MB",
    acceptedTypes: ["application/pdf"],
    acceptedExtensions: ".pdf",
} as const;
