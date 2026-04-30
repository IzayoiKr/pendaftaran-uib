// Requires: npm install puppeteer

import { type NextRequest, NextResponse } from "next/server";
import { generateLoaHtml, type LoaData } from "@/lib/loaTemplate";
import type { JenisBeasiswa } from "@/constants/biaya";

async function htmlToPdf(html: string): Promise<Buffer> {
    const puppeteer = await import("puppeteer").catch(() => null);
    if (!puppeteer) throw new Error("Puppeteer belum diinstall. Jalankan: npm install puppeteer");

    const browser = await puppeteer.default.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    try {
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: "networkidle0" });
        const pdf = await page.pdf({
            format:          "A4",
            printBackground: true,
            margin: { top: "16mm", bottom: "16mm", left: "12mm", right: "12mm" },
        });
        return Buffer.from(pdf);
    } finally {
        await browser.close();
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: { nomorDaftar: string } }
) {
    // ── Auth ──────────────────────────────────────────────────────────────────
    const token = request.headers.get("authorization")?.replace("Bearer ", "") ?? "";
    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { nomorDaftar } = params;

    // ── Fetch data dari backend Go ────────────────────────────────────────────
    const backendUrl = process.env.BACKEND_URL ?? "http://backend:8080";
    let reg: Record<string, string>;

    try {
        const res = await fetch(
            `${backendUrl}/api/registrations/${encodeURIComponent(nomorDaftar)}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.status === 401) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        if (!res.ok)            return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
        reg = await res.json() as Record<string, string>;
    } catch {
        // ── DEV FALLBACK — hapus di production ──────────────────────────────
        reg = {
            nomorDaftar,
            nomorSurat:      `0001/PMB/SKL-UIB/XI/2025`,
            namaLengkap:     "Nama Mahasiswa",
            namaSekolah:     "SMA Contoh",
            gelombang:       "Beasiswa Cemerlang",
            tahunAkademik:   "2025/2026",
            tempatUjian:     "Online",
            tanggalUjian:    "03 November 2025",
            prodi:           "Teknologi Informasi",
            kelasKuliah:     "Kelas Malam",
            namaBeasiswa:    "Beasiswa Cemerlang",
            namaBank:        "OCBC Bank",
            noRekening:      "1222000922520068",
            atasNama:        "Nama Mahasiswa",
            tanggalDeadline: "27 November 2025",
            tanggalSurat:    "02 September 2025",
            cicilanDeadline: "01 Desember 2025",
        };
    }

    // ── Build LoaData ─────────────────────────────────────────────────────────
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
        kelasKuliah:     reg.kelasKuliah     ?? "Kelas Reguler",
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

    // ── Generate PDF ──────────────────────────────────────────────────────────
    const html = generateLoaHtml(loaData);
    let pdfBuffer: Buffer;

    try {
        pdfBuffer = await htmlToPdf(html);
    } catch (err) {
        console.error("[surat-hasil] htmlToPdf error:", err);
        return NextResponse.json(
            { error: "Gagal generate PDF. Pastikan Puppeteer sudah diinstall." },
            { status: 500 }
        );
    }

    return new NextResponse(pdfBuffer, {
        headers: {
            "Content-Type":        "application/pdf",
            "Content-Disposition": `attachment; filename="surat-hasil-${nomorDaftar}.pdf"`,
            "Cache-Control":       "no-store",
        },
    });
}