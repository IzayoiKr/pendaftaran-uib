// src/app/api/surat-hasil/[nomorDaftar]/route.ts
// Serve Surat Hasil sebagai HTML murni — tidak pakai Puppeteer.
// User buka di tab baru → Ctrl+P / tombol Print → Save as PDF.
//
// Data mapping dari backend Go:
//
// JOIN pendaftaran_gelombang pg
//   ON pg.gelombang_id = master_gelombang.id
// WHERE pg.nomor_daftar = :nomorDaftar
//
// Field yang di-fetch:
//   pg.nomor_daftar, pg.nama, pg.asal_sekolah, pg.prodipil,
//   pg.waktukuliah, pg.jenisdaftar
//   mg.nama           → gelombang
//   mg.tahun_akademik → tahunAkademik
//   mg.lokasi         → tempatUjian
//   mg.tanggal_ujian  → tanggalUjian
//
// Field tambahan dari admin (belum ada di schema, perlu ditambah ke DB atau hardcode):
//   nomor_surat, nama_beasiswa, nama_bank, no_rekening, atas_nama,
//   tanggal_deadline, tanggal_surat, cicilan_deadline

import { type NextRequest, NextResponse } from "next/server";
import { generateLoaHtml, type LoaData } from "@/lib/loaTemplate";
import type { JenisBeasiswa, KelasKuliah } from "@/constants/biaya";
import { DEFAULT_KELAS } from "@/constants/biaya";

// ─── Helper: format tanggal dari "YYYY-MM-DD" ke "DD Bulan YYYY" ─────────────
function formatTanggalIndo(dateStr: string): string {
    if (!dateStr) return "-";
    const bulan = [
        "", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember",
    ];
    const [y, m, d] = dateStr.split("-");
    return `${parseInt(d)} ${bulan[parseInt(m)]} ${y}`;
}

// ─── Helper: map waktukuliah dari DB ke KelasKuliah type ─────────────────────
// Di DB: waktukuliah = "pagi" | "malam" (dari pendaftaran_gelombang)
function mapKelasKuliah(waktuKuliah: string): KelasKuliah {
    const val = waktuKuliah?.toLowerCase() ?? "";
    if (val.includes("pagi"))  return "Kelas Pagi";
    if (val.includes("malam")) return "Kelas Malam";
    return DEFAULT_KELAS;
}

// ─── Backend response type (JOIN result dari Go) ──────────────────────────────
interface RegistrationResponse {
    // dari pendaftaran_gelombang
    nomor_daftar:     string;
    nama:             string;   // namaLengkap
    asal_sekolah:     string;   // namaSekolah
    prodipil:         string;   // prodi pilihan pertama
    waktukuliah:      string;   // "pagi" | "malam"
    jenisdaftar:      string;   // "Reguler" | "Beasiswa"

    // dari master_gelombang (JOIN)
    gelombang_nama:   string;   // nama gelombang, misal "Gelombang Beasiswa II"
    tahun_akademik:   string;   // "2025/2026"
    lokasi:           string;   // "Online" | "Batam" | "Tanjung Pinang"
    tanggal_ujian:    string;   // "YYYY-MM-DD"

    // field tambahan dari admin / logika bisnis
    // TODO: tambah kolom ini ke tabel pendaftaran_gelombang atau tabel tersendiri
    nomor_surat?:      string;
    nama_beasiswa?:    string;
    nama_bank?:        string;
    no_rekening?:      string;
    atas_nama?:        string;
    tanggal_deadline?: string;
    tanggal_surat?:    string;
    cicilan_deadline?: string;
}

export async function GET(
    request: NextRequest,
    { params }: { params: { nomorDaftar: string } }
) {
    // ── Auth ──────────────────────────────────────────────────────────────────
    const token = request.cookies.get("access_token")?.value
        ?? request.headers.get("authorization")?.replace("Bearer ", "")
        ?? "";

    if (!token) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { nomorDaftar } = params;
    if (!nomorDaftar) {
        return new NextResponse("Nomor daftar tidak valid", { status: 400 });
    }

    // ── Fetch dari backend Go ─────────────────────────────────────────────────
    // Endpoint Go harus JOIN pendaftaran_gelombang + master_gelombang
    // dan return RegistrationResponse di atas
    const backendUrl = process.env.BACKEND_URL ?? "http://backend:8080";
    let reg: RegistrationResponse;

    try {
        const res = await fetch(
            `${backendUrl}/api/registrations/${encodeURIComponent(nomorDaftar)}`,
            {
                headers: { Authorization: `Bearer ${token}` },
                cache: "no-store",
            }
        );

        if (res.status === 401) return new NextResponse("Unauthorized", { status: 401 });
        if (res.status === 404) return new NextResponse("Data tidak ditemukan", { status: 404 });
        if (!res.ok)            return new NextResponse("Gagal fetch data", { status: 500 });

        reg = await res.json() as RegistrationResponse;
    } catch {
        // ── DEV FALLBACK — hapus saat production ─────────────────────────────
        // Sesuai schema: waktukuliah = "malam" dari form pendaftaran
        reg = {
            nomor_daftar:    nomorDaftar,
            nama:            "Nama Mahasiswa",
            asal_sekolah:    "SMA Contoh Batam",
            prodipil:        "Teknologi Informasi",
            waktukuliah:     "malam",
            jenisdaftar:     "Beasiswa",
            gelombang_nama:  "Beasiswa Cemerlang",
            tahun_akademik:  "2025/2026",
            lokasi:          "Online",
            tanggal_ujian:   "2025-11-03",
            nama_beasiswa:   "Beasiswa Cemerlang",
            nama_bank:       "OCBC Bank",
            no_rekening:     "1222000922520068",
            atas_nama:       "Nama Mahasiswa",
            tanggal_deadline: "2025-11-27",
            tanggal_surat:   new Date().toISOString().split("T")[0],
            cicilan_deadline: "2025-12-01",
            nomor_surat:     `0001/PMB/SKL-UIB/XI/2025`,
        };
    }

    // ── Map ke LoaData ────────────────────────────────────────────────────────
    const today = new Date().toLocaleDateString("id-ID", {
        day: "2-digit", month: "long", year: "numeric",
    });

    const loaData: LoaData = {
        // dari pendaftaran_gelombang
        nomorDaftar:  reg.nomor_daftar,
        namaLengkap:  reg.nama,
        namaSekolah:  reg.asal_sekolah,
        prodi:        reg.prodipil,
        kelasKuliah:  mapKelasKuliah(reg.waktukuliah),

        // dari master_gelombang
        gelombang:    reg.gelombang_nama,
        tahunAkademik: reg.tahun_akademik,
        tempatUjian:  reg.lokasi,
        tanggalUjian: formatTanggalIndo(reg.tanggal_ujian),

        // dari admin / logika bisnis
        nomorSurat:      reg.nomor_surat      ?? `0001/PMB/SKL-UIB/XI/${new Date().getFullYear()}`,
        namaBeasiswa:    (reg.nama_beasiswa   ?? "Beasiswa Insan Mandiri") as JenisBeasiswa,
        namaBank:        reg.nama_bank        ?? "OCBC Bank",
        noRekening:      reg.no_rekening      ?? "-",
        atasNama:        reg.atas_nama        ?? reg.nama,
        tanggalDeadline: formatTanggalIndo(reg.tanggal_deadline ?? ""),
        tanggalSurat:    formatTanggalIndo(reg.tanggal_surat    ?? "") || today,
        cicilanDeadline: formatTanggalIndo(reg.cicilan_deadline ?? ""),
    };

    // ── Generate & serve HTML ─────────────────────────────────────────────────
    const html = generateLoaHtml(loaData);

    return new NextResponse(html, {
        status: 200,
        headers: {
            "Content-Type":  "text/html; charset=utf-8",
            "Cache-Control": "no-store",
        },
    });
}