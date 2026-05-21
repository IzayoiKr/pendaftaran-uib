// src/lib/loaTemplate.ts
// Generator HTML Surat Hasil / LoA UIB
// Template HTML   → loaTemplate.html  (dibaca fs.readFileSync)
// Style           → loaTemplate.scss  (dibaca fs.readFileSync, dikompilasi sass.compileString)
// Logo            → public/favicon/uib-180.png (dibaca fs.readFileSync, di-embed sebagai base64)
// Hanya berjalan di server (Route Handler / Node.js)

import fs   from "fs";
import path from "path";
import sass from "sass";

import {
    hitungTotalBiaya,
    formatRupiah,
    type JenisBeasiswa,
    type KelasKuliah,
    DEFAULT_KELAS,
} from "@/constants/biaya";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface LoaData {
    nomorDaftar:     string;
    namaLengkap:     string;
    namaSekolah:     string;
    prodi:           string;
    kelasKuliah:     KelasKuliah;
    gelombang:       string;
    tahunAkademik:   string;
    tempatUjian:     string;
    tanggalUjian:    string;
    nomorSurat:      string;
    namaBeasiswa:    JenisBeasiswa;
    namaBank:        string;
    noRekening:      string;
    atasNama:        string;
    tanggalDeadline: string;
    tanggalSurat:    string;
    cicilanDeadline: string;
}

// ─── Load & compile template files (server-only) ───────────────────────────────

const LIB_DIR      = path.join(process.cwd(), "src", "lib");
const htmlTemplate = fs.readFileSync(path.join(LIB_DIR, "loaTemplate.html"), "utf-8");
const scssSource   = fs.readFileSync(path.join(LIB_DIR, "loaTemplate.scss"), "utf-8");

const compiledCss  = sass.compileString(scssSource, {
    loadPaths: [LIB_DIR],
}).css;

// Logo di-embed sebagai base64 data URI agar tetap muncul di blob URL
// (blob:// tidak bisa load resource relatif seperti /favicon/uib-180.png)
const logoPath   = path.join(process.cwd(), "public", "favicon", "uib-180.png");
const logoBase64 = (() => {
    try {
        const buf = fs.readFileSync(logoPath);
        return `data:image/png;base64,${buf.toString("base64")}`;
    } catch {
        return ""; // jika file tidak ada, img akan trigger onerror → hidden
    }
})();

// ─── Private Helpers ───────────────────────────────────────────────────────────

function row(label: string, nilai: string): string {
    return `<tr><td>${label}</td><td>${nilai}</td></tr>`;
}

function sectionHeader(label: string): string {
    return `<tr class="section-header"><td colspan="2">${label}</td></tr>`;
}

function buildBiayaRows(data: LoaData): string {
    const calc                = hitungTotalBiaya(data.prodi, data.namaBeasiswa);
    const { biaya, potongan } = calc;

    return [
        sectionHeader("A. Biaya Mahasiswa Baru (sekali bayar tahun pertama)"),
        row("&nbsp;&nbsp;1) Sumbangan Penyelenggaraan Pendidikan (SPP) / Uang Gedung", formatRupiah(biaya.spp)),
        row("&nbsp;&nbsp;2) Biaya PPL (Penyelenggaraan Pendidikan &amp; Lain-lain)",   formatRupiah(biaya.bppl)),

        sectionHeader("B. Biaya Kuliah Semester I"),
        row("&nbsp;&nbsp;1) BPP Pokok",          formatRupiah(biaya.bppPokok)),
        row("&nbsp;&nbsp;2) BPP SKS Semester I", formatRupiah(biaya.bppSks)),
        biaya.bppPraktikum > 0
            ? row("&nbsp;&nbsp;3) BPP Praktikum", formatRupiah(biaya.bppPraktikum))
            : "",

        `<tr class="section-header"><td>SUBTOTAL SEBELUM BEASISWA</td><td>${formatRupiah(calc.totalSebelumPotongan)}</td></tr>`,

        sectionHeader(`C. BEASISWA: ${data.namaBeasiswa} — ${potongan.label}`),
        calc.potonganBppPokok     > 0 ? row(`&nbsp;&nbsp;Potongan BPP Pokok (${potongan.potonganBppPokok}%)`,         formatRupiah(calc.potonganBppPokok))     : "",
        calc.potonganBppSks       > 0 ? row(`&nbsp;&nbsp;Potongan BPP SKS (${potongan.potonganBppSks}%)`,             formatRupiah(calc.potonganBppSks))       : "",
        calc.potonganBppPraktikum > 0 ? row(`&nbsp;&nbsp;Potongan BPP Praktikum (${potongan.potonganBppPraktikum}%)`, formatRupiah(calc.potonganBppPraktikum)) : "",
        calc.potonganSpp          > 0 ? row(`&nbsp;&nbsp;Potongan SPP (${potongan.potonganSpp}%)`,                    formatRupiah(calc.potonganSpp))          : "",
    ].join("\n");
}

// ─── Generate HTML ─────────────────────────────────────────────────────────────

export function generateLoaHtml(data: LoaData): string {
    const calc           = hitungTotalBiaya(data.prodi, data.namaBeasiswa);
    const kelas          = data.kelasKuliah ?? DEFAULT_KELAS;
    const cicilanMinimal = formatRupiah(Math.min(calc.totalBayar, 3_000_000));

    return htmlTemplate
        .replace("{{__INJECTED_STYLES__}}", compiledCss)
        .replace("{{__BIAYA_ROWS__}}",      buildBiayaRows(data))
        .replace("{{__LOGO_BASE64__}}",     logoBase64)
        .replaceAll("{{nomorDaftar}}",     data.nomorDaftar)
        .replaceAll("{{nomorSurat}}",      data.nomorSurat)
        .replaceAll("{{tahunAkademik}}",   data.tahunAkademik)
        .replaceAll("{{namaLengkap}}",     data.namaLengkap)
        .replaceAll("{{namaSekolah}}",     data.namaSekolah)
        .replaceAll("{{gelombang}}",       data.gelombang)
        .replaceAll("{{tempatUjian}}",     data.tempatUjian)
        .replaceAll("{{tanggalUjian}}",    data.tanggalUjian)
        .replaceAll("{{namaBeasiswa}}",    data.namaBeasiswa)
        .replaceAll("{{prodi}}",           data.prodi)
        .replaceAll("{{kelasKuliah}}",     kelas)
        .replaceAll("{{totalPotongan}}",   formatRupiah(calc.totalPotongan))
        .replaceAll("{{totalBayar}}",      formatRupiah(calc.totalBayar))
        .replaceAll("{{tanggalDeadline}}", data.tanggalDeadline)
        .replaceAll("{{namaBank}}",        data.namaBank)
        .replaceAll("{{noRekening}}",      data.noRekening)
        .replaceAll("{{atasNama}}",        data.atasNama)
        .replaceAll("{{cicilanMinimal}}",  cicilanMinimal)
        .replaceAll("{{cicilanDeadline}}", data.cicilanDeadline)
        .replaceAll("{{tanggalSurat}}",    data.tanggalSurat);
}