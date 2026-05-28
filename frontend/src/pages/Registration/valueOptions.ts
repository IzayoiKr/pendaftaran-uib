export const JENIS_KELAMIN = {
    LAKI_LAKI: "L",
    PEREMPUAN: "P",
} as const;

export const KEWARGANEGARAAN = {
    WNI: "WNI",
    WNA: "WNA",
    STATELESS: "STATELESS",
} as const;

export const JENJANG_PENDIDIKAN = {
    D3: "D3",
    D4: "D4",
    S1: "S1",
    S2: "S2",
} as const;

export const AGAMA = {
    NOT_SPECIFIED: "NOT_SPECIFIED",
    ISLAM: "ISLAM",
    KATOLIK: "KATOLIK",
    KRISTEN: "KRISTEN",
    HINDU: "HINDU",
    BUDDHA: "BUDDHA",
    KONGHUCU: "KONGHUCU",
} as const;

export const SUMBER_BIAYA = {
    SENDIRI: "SENDIRI",
    INSTANSI: "INSTANSI",
    LAINNYA: "LAINNYA",
} as const;

export const STATUS_INSTANSI = {
    PEMERINTAH: "PEMERINTAH",
    SWASTA: "SWASTA",
    BUMN: "BUMN",
    PTN: "PTN",
    PTS: "PTS",
} as const;

export const JENIS_DAFTAR = {
    BARU: "BARU",
    ALIH_JENJANG: "ALIH_JENJANG",
    TRANSFER: "TRANSFER",
} as const;

export const WAKTU_KULIAH = {
    PAGI: "PAGI",
    MALAM: "MALAM",
} as const;

export const PENDIDIKAN = {
    NOT_SPECIFIED: "NOT_SPECIFIED",
    TIDAK_TAMAT_SD: "TIDAK_TAMAT_SD",
    SD: "SD",
    SMP: "SMP",
    SMA_SMK: "SMA_SMK",
    D1: "D1",
    D2: "D2",
    D3: "D3",
    D4: "D4",
    S1: "S1",
    PROFESI: "PROFESI",
    SP_1: "SP_1",
    S2: "S2",
    SP_2: "SP_2",
    S3: "S3",
    NON_AKADEMIK: "NON_AKADEMIK",
} as const;

export const PEKERJAAN = {
    NOT_SPECIFIED: "NOT_SPECIFIED",
    PNS_ASN: "PNS_ASN",
    TNI_POLRI: "TNI_POLRI",
    PENGAJAR: "PENGAJAR",
    SWASTA: "SWASTA",
    BUMN_BUMD: "BUMN_BUMD",
    WIRASWASTA: "WIRASWASTA",
    PROFESIONAL: "PROFESIONAL",
    PETANI_NELAYAN: "PETANI_NELAYAN",
    BURUH: "BURUH",
    IRT: "IRT",
    PENSIUNAN: "PENSIUNAN",
    LAINNYA: "LAINNYA",
} as const;

export const PENGHASILAN = {
    NONE: "NO_INCOME",
    UNDER_500K: "UNDER_500K",
    UNDER_1M: "500K_TO_1M",
    UNDER_2M5: "1M_TO_2M5",
    UNDER_5M: "2M5_TO_5M",
    UNDER_7M5: "5M_TO_7M5",
    UNDER_10M: "7M5_TO_10M",
    ABOVE_10M: "ABOVE_10M",
} as const;

export const STATUS_ORANG_TUA = {
    HIDUP: "HIDUP",
    MENINGGAL: "MENINGGAL",
} as const;
