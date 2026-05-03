// src/app/api/surat-hasil/[nomorDaftar]/route.ts
// Serve Surat Hasil sebagai HTML murni — tidak pakai Puppeteer.
// User buka di tab baru → Ctrl+P → Save as PDF dari browser sendiri.

import { type NextRequest, NextResponse } from "next/server";
import { generateLoaHtml, type LoaData } from "@/lib/loaTemplate";
import type { JenisBeasiswa, KelasKuliah } from "@/constants/biaya";
import { DEFAULT_KELAS } from "@/constants/biaya";

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

    // ── Fetch data dari backend Go ─────────────────────────────────────────
    const backendUrl = process.env.BACKEND_URL ?? "http://backend:8080";
    let reg: Record<string, string>;

    try {
        const res = await fetch(
            `${backendUrl}/api/registrations/${encodeURIComponent(nomorDaftar)}`,
            { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }
        );
        if (res.status === 401) return new NextResponse("Unauthorized", { status: 401 });
        if (!res.ok)            return new NextResponse("Data tidak ditemukan", { status: 404 });
        reg = await res.json() as Record<string, string>;
    } catch {
        // DEV FALLBACK — hapus saat production atau backend sudah siap
        reg = {
            nomorDaftar,
            nomorSurat:      "0001/PMB/SKL-UIB/XI/2025",
            namaLengkap:     "Nama Mahasiswa",
            namaSekolah:     "SMA Contoh Batam",
            gelombang:       "Beasiswa Cemerlang",
            tahunAkademik:   "2025/2026",
            tempatUjian:     "Online",
            tanggalUjian:    "03 November 2025",
            prodi:           "Teknologi Informasi",
            kelasKuliah:     DEFAULT_KELAS,
            namaBeasiswa:    "Beasiswa Cemerlang",
            namaBank:        "OCBC Bank",
            noRekening:      "1222000922520068",
            atasNama:        "Nama Mahasiswa",
            tanggalDeadline: "27 November 2025",
            tanggalSurat:    new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }),
            cicilanDeadline: "01 Desember 2025",
        };
    }

    // ── Build LoaData ─────────────────────────────────────────────────────
    const loaData: LoaData = {
        nomorSurat:      reg.nomorSurat      ?? "0001/PMB/SKL-UIB/XI/2025",
        nomorDaftar:     reg.nomorDaftar     ?? nomorDaftar,
        namaLengkap:     reg.namaLengkap     ?? "-",
        namaSekolah:     reg.namaSekolah     ?? "-",
        gelombang:       reg.gelombang       ?? "-",
        tahunAkademik:   reg.tahunAkademik   ?? "2025/2026",
        tempatUjian:     reg.tempatUjian     ?? "Online",
        tanggalUjian:    reg.tanggalUjian    ?? "-",
        prodi:           reg.prodi           ?? "Teknologi Informasi",
        kelasKuliah:     (reg.kelasKuliah    ?? DEFAULT_KELAS) as KelasKuliah,
        namaBeasiswa:    (reg.namaBeasiswa   ?? "Beasiswa Insan Mandiri") as JenisBeasiswa,
        namaBank:        reg.namaBank        ?? "OCBC Bank",
        noRekening:      reg.noRekening      ?? "-",
        atasNama:        reg.atasNama        ?? reg.namaLengkap ?? "-",
        tanggalDeadline: reg.tanggalDeadline ?? "-",
        tanggalSurat:    reg.tanggalSurat    ?? new Date().toLocaleDateString("id-ID", {
            day: "2-digit", month: "long", year: "numeric",
        }),
        cicilanDeadline: reg.cicilanDeadline ?? "-",
    };

    // ── Generate & serve HTML ─────────────────────────────────────────────
    const html = generateLoaHtml(loaData);

    return new NextResponse(html, {
        status: 200,
        headers: {
            "Content-Type":  "text/html; charset=utf-8",
            "Cache-Control": "no-store",
        },
    });
}