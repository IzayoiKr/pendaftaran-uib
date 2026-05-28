// src/constants/biaya.ts
// Data biaya kuliah per prodi dan per jenis beasiswa UIB
// Edit file ini saja kalau ada perubahan harga

// ─── Types ────────────────────────────────────────────────────────────────────

export interface KomponenBiaya {
    spp: number; // Uang Gedung / SPP (sekali bayar tahun pertama)
    bppl: number; // Biaya PPL (Penyelenggaraan Pendidikan & Lain-lain)
    bppPokok: number; // BPP Pokok per semester
    bppSks: number; // BPP SKS semester I
    bppPraktikum: number; // BPP Praktikum (0 jika tidak ada)
}

export type JenisBeasiswa =
    | "Beasiswa I"
    | "Beasiswa II"
    | "Beasiswa III"
    | "Beasiswa IV"
    | "Beasiswa Cemerlang"
    | "Beasiswa Insan Mandiri"
    | "KIP-K";

export type KelasKuliah = "Kelas Malam" | "Kelas Pagi";

export const DEFAULT_KELAS: KelasKuliah = "Kelas Malam";

export interface PotonganBeasiswa {
    potonganBppPokok: number; // persentase 0-100
    potonganBppSks: number;
    potonganBppPraktikum: number;
    potonganSpp: number;
    label: string; // label singkat untuk ditampilkan di LoA
}

// ─── Biaya per Prodi ──────────────────────────────────────────────────────────
// Key: nama prodi lowercase — harus match dengan data dari backend Go
export const BIAYA_PRODI: Record<string, KomponenBiaya> = {
    "teknologi informasi": {
        spp: 10_000_000,
        bppl: 3_000_000,
        bppPokok: 6_000_000,
        bppSks: 3_150_000,
        bppPraktikum: 750_000,
    },
    "sistem informasi": {
        spp: 10_000_000,
        bppl: 3_000_000,
        bppPokok: 6_000_000,
        bppSks: 3_150_000,
        bppPraktikum: 750_000,
    },
    manajemen: {
        spp: 9_000_000,
        bppl: 2_500_000,
        bppPokok: 5_500_000,
        bppSks: 2_800_000,
        bppPraktikum: 0,
    },
    akuntansi: {
        spp: 9_000_000,
        bppl: 2_500_000,
        bppPokok: 5_500_000,
        bppSks: 2_800_000,
        bppPraktikum: 0,
    },
    "ilmu hukum": {
        spp: 8_500_000,
        bppl: 2_500_000,
        bppPokok: 5_000_000,
        bppSks: 2_500_000,
        bppPraktikum: 0,
    },
    "teknik sipil": {
        spp: 10_500_000,
        bppl: 3_000_000,
        bppPokok: 6_500_000,
        bppSks: 3_500_000,
        bppPraktikum: 1_000_000,
    },
    arsitektur: {
        spp: 10_500_000,
        bppl: 3_000_000,
        bppPokok: 6_500_000,
        bppSks: 3_500_000,
        bppPraktikum: 1_000_000,
    },
    pariwisata: {
        spp: 8_000_000,
        bppl: 2_000_000,
        bppPokok: 4_500_000,
        bppSks: 2_200_000,
        bppPraktikum: 0,
    },
    "pendidikan bahasa inggris": {
        spp: 8_000_000,
        bppl: 2_000_000,
        bppPokok: 4_500_000,
        bppSks: 2_200_000,
        bppPraktikum: 0,
    },
    biologi: {
        spp: 9_000_000,
        bppl: 2_500_000,
        bppPokok: 5_500_000,
        bppSks: 2_800_000,
        bppPraktikum: 500_000,
    },
    gizi: {
        spp: 9_500_000,
        bppl: 2_500_000,
        bppPokok: 5_800_000,
        bppSks: 3_000_000,
        bppPraktikum: 750_000,
    },
    kedokteran: {
        spp: 25_000_000,
        bppl: 5_000_000,
        bppPokok: 15_000_000,
        bppSks: 8_000_000,
        bppPraktikum: 3_000_000,
    },
    // fallback jika prodi tidak ditemukan
    __default__: {
        spp: 10_000_000,
        bppl: 3_000_000,
        bppPokok: 6_000_000,
        bppSks: 3_150_000,
        bppPraktikum: 750_000,
    },
};

// ─── Potongan per Jenis Beasiswa ──────────────────────────────────────────────
export const POTONGAN_BEASISWA: Record<JenisBeasiswa, PotonganBeasiswa> = {
    "Beasiswa I": {
        potonganBppPokok: 25,
        potonganBppSks: 25,
        potonganBppPraktikum: 25,
        potonganSpp: 0,
        label: "Beasiswa I (Potongan 25%)",
    },
    "Beasiswa II": {
        potonganBppPokok: 50,
        potonganBppSks: 50,
        potonganBppPraktikum: 50,
        potonganSpp: 0,
        label: "Beasiswa II (Potongan 50%)",
    },
    "Beasiswa III": {
        potonganBppPokok: 75,
        potonganBppSks: 75,
        potonganBppPraktikum: 75,
        potonganSpp: 0,
        label: "Beasiswa III (Potongan 75%)",
    },
    "Beasiswa IV": {
        potonganBppPokok: 100,
        potonganBppSks: 100,
        potonganBppPraktikum: 100,
        potonganSpp: 0,
        label: "Beasiswa IV (Potongan 100% BPP)",
    },
    "Beasiswa Cemerlang": {
        potonganBppPokok: 100,
        potonganBppSks: 100,
        potonganBppPraktikum: 100,
        potonganSpp: 0,
        label: "Beasiswa Cemerlang (Potongan 100% BPP)",
    },
    "Beasiswa Insan Mandiri": {
        potonganBppPokok: 0,
        potonganBppSks: 0,
        potonganBppPraktikum: 0,
        potonganSpp: 0,
        label: "Beasiswa Insan Mandiri (Tanpa Potongan)",
    },
    "KIP-K": {
        potonganBppPokok: 100,
        potonganBppSks: 100,
        potonganBppPraktikum: 100,
        potonganSpp: 100,
        label: "KIP-K (Gratis Penuh)",
    },
};

// ─── Helper: hitung total biaya ───────────────────────────────────────────────
export function hitungTotalBiaya(prodi: string, beasiswa: JenisBeasiswa) {
    const biaya =
        BIAYA_PRODI[prodi.toLowerCase()] ?? BIAYA_PRODI["__default__"];
    const potongan =
        POTONGAN_BEASISWA[beasiswa] ??
        POTONGAN_BEASISWA["Beasiswa Insan Mandiri"];

    const potonganSpp = Math.round((biaya.spp * potongan.potonganSpp) / 100);
    const potonganBppPokok = Math.round(
        (biaya.bppPokok * potongan.potonganBppPokok) / 100,
    );
    const potonganBppSks = Math.round(
        (biaya.bppSks * potongan.potonganBppSks) / 100,
    );
    const potonganBppPraktikum = Math.round(
        (biaya.bppPraktikum * potongan.potonganBppPraktikum) / 100,
    );
    const totalPotongan =
        potonganSpp + potonganBppPokok + potonganBppSks + potonganBppPraktikum;
    const totalSebelumPotongan =
        biaya.spp +
        biaya.bppl +
        biaya.bppPokok +
        biaya.bppSks +
        biaya.bppPraktikum;
    const totalBayar = totalSebelumPotongan - totalPotongan;

    return {
        biaya,
        potongan,
        potonganSpp,
        potonganBppPokok,
        potonganBppSks,
        potonganBppPraktikum,
        totalPotongan,
        totalSebelumPotongan,
        totalBayar,
    };
}

// ─── Helper: format rupiah ────────────────────────────────────────────────────
export function formatRupiah(n: number): string {
    return "Rp " + n.toLocaleString("id-ID");
}
