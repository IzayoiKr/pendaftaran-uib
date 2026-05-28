// src/app/surat-hasil/[nomorDaftar]/route.ts
//
// PENTING: Taruh di src/app/surat-hasil/ BUKAN src/app/api/
// karena next.config.ts merewrite /api/* ke backend Go.
// Route di luar /api/ tidak kena rewrite sama sekali.
//
// Field mapping sesuai registration_details.go:
//   S1: nik, email, nama, jk, waktu_kuliah, asal_sekolah,
//       prodi_pil, prodi_pil_name, registrationKey, batchName,
//       doc_check_status, payment_status, usm_password
//   gelombang JOIN: event_date, start_time, end_time, location
import { type NextRequest, NextResponse } from "next/server";
import type { JenisBeasiswa, KelasKuliah } from "@/constants/biaya";
import { DEFAULT_KELAS } from "@/constants/biaya";
import { type LoaData, generateLoaHtml } from "@/lib/loaTemplate";

// ─── Helper: format tanggal ke "DD Bulan YYYY" ───────────────────────────────
function formatTanggalIndo(dateStr: string): string {
    if (!dateStr) return "-";
    const BULAN = [
        "",
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember",
    ];
    try {
        const clean = dateStr.split("T")[0]; // strip time if ISO
        const [y, m, d] = clean.split("-");
        return `${parseInt(d)} ${BULAN[parseInt(m)]} ${y}`;
    } catch {
        return dateStr;
    }
}

// ─── Helper: waktu_kuliah → KelasKuliah ──────────────────────────────────────
function mapKelas(v: string): KelasKuliah {
    return (v ?? "").toLowerCase().includes("pagi")
        ? "Kelas Pagi"
        : DEFAULT_KELAS;
}

// ─── Helper: batchName → JenisBeasiswa ───────────────────────────────────────
function mapBeasiswa(batchName: string): JenisBeasiswa {
    const b = (batchName ?? "").toLowerCase();
    if (b.includes("cemerlang")) return "Beasiswa Cemerlang";
    if (b.includes("kip")) return "KIP-K";
    if (b.includes("iv") || b.includes("4")) return "Beasiswa IV";
    if (b.includes("iii") || b.includes("3")) return "Beasiswa III";
    if (b.includes("ii") || b.includes("2")) return "Beasiswa II";
    if (b.includes("insan") || b.includes("mandiri"))
        return "Beasiswa Insan Mandiri";
    if (b.includes("beasiswa") || b.includes("i") || b.includes("1"))
        return "Beasiswa I";
    return "Beasiswa Insan Mandiri";
}

// ─── Types sesuai registration_details.go S1 response ────────────────────────
interface RegDetailS1 {
    type: string; // "S1"
    nik: string;
    email: string;
    nama: string;
    jk: string;
    waktu_kuliah: string; // "pagi" | "malam"
    asal_sekolah: string;
    prodi_pil: string; // UUID
    prodi_pil_name: string; // "Teknologi Informasi"
    registrationKey: string; // batch_key
    batchName: string; // "Beasiswa Cemerlang"
    doc_check_status: string;
    payment_status: string;
    usm_password: string;
}

// ─── Types sesuai gelombang handler response ──────────────────────────────────
interface GelombangDetail {
    batch_name: string;
    academic_year: string;
    location: string;
    event_date: string;
    start_time: string;
    end_time: string;
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ nomorDaftar: string }> },
) {
    // ── Auth — ambil token dari cookie atau Authorization header ──────────────
    const token =
        request.cookies.get("access_token")?.value ??
        request.headers.get("authorization")?.replace("Bearer ", "") ??
        "";

    if (!token) {
        return new NextResponse(
            "<h2>401 - Silakan login terlebih dahulu</h2>",
            {
                status: 401,
                headers: { "Content-Type": "text/html" },
            },
        );
    }

    const { nomorDaftar } = await params;
    if (!nomorDaftar) {
        return new NextResponse("Nomor daftar tidak valid", { status: 400 });
    }

    const BACKEND = process.env.BACKEND_URL ?? "http://backend:8080";
    const AUTH = { Authorization: `Bearer ${token}` };

    let reg: RegDetailS1;
    let gel: GelombangDetail | null = null;

    try {
        // ── 1. Fetch registration details ─────────────────────────────────────
        // GET /api/registration/:id — sesuai registration_details.go
        // nomorDaftar bisa formatted ID (OL2510001) atau UUID
        const regRes = await fetch(
            `${BACKEND}/api/registration/${encodeURIComponent(nomorDaftar)}`,
            { headers: AUTH, cache: "no-store" },
        );

        if (regRes.status === 401) {
            return new NextResponse(
                "<h2>401 - Sesi habis, silakan login ulang</h2>",
                { status: 401, headers: { "Content-Type": "text/html" } },
            );
        }
        if (regRes.status === 404) {
            return new NextResponse(
                "<h2>404 - Data pendaftaran tidak ditemukan</h2>",
                { status: 404, headers: { "Content-Type": "text/html" } },
            );
        }
        if (!regRes.ok) {
            const txt = await regRes.text().catch(() => "");
            console.error("[surat-hasil] backend error:", regRes.status, txt);
            return new NextResponse(
                `<h2>502 - Gagal fetch data (${regRes.status})</h2>`,
                { status: 502, headers: { "Content-Type": "text/html" } },
            );
        }

        reg = (await regRes.json()) as RegDetailS1;

        // ── 2. Fetch gelombang detail ─────────────────────────────────────────
        // GET /api/gelombang/:registrationKey
        if (reg.registrationKey) {
            const gelRes = await fetch(
                `${BACKEND}/api/gelombang/${encodeURIComponent(reg.registrationKey)}`,
                { headers: AUTH, cache: "no-store" },
            ).catch(() => null);

            if (gelRes?.ok) {
                gel = (await gelRes.json()) as GelombangDetail;
            }
        }
    } catch (err) {
        console.error("[surat-hasil] fetch error:", err);

        // DEV FALLBACK — comment/hapus saat production backend siap
        if (process.env.NODE_ENV !== "production") {
            reg = {
                type: "S1",
                nik: "1234567890123456",
                email: "mahasiswa@example.com",
                nama: "Nama Mahasiswa",
                jk: "l",
                waktu_kuliah: "malam",
                asal_sekolah: "SMA Contoh Batam",
                prodi_pil: "uuid-prodi",
                prodi_pil_name: "Teknologi Informasi",
                registrationKey: "s1-beasiswa-2025",
                batchName: "Beasiswa Cemerlang",
                doc_check_status: "Telah Lengkap",
                payment_status: "Telah Lunas",
                usm_password: "USM2025",
            };
            gel = {
                batch_name: "Beasiswa Cemerlang",
                academic_year: "2025/2026",
                location: "Online",
                event_date: "2025-11-03",
                start_time: "09:00",
                end_time: "12:00",
            };
        } else {
            return new NextResponse(
                "<h2>503 - Layanan tidak tersedia, coba lagi nanti</h2>",
                { status: 503, headers: { "Content-Type": "text/html" } },
            );
        }
    }

    // ── Build LoaData ──────────────────────────────────────────────────────────
    const today = new Date().toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });

    const loaData: LoaData = {
        nomorSurat: `0001/PMB/SKL-UIB/XI/${new Date().getFullYear()}`,
        nomorDaftar,
        namaLengkap: reg.nama ?? "-",
        namaSekolah: reg.asal_sekolah ?? "-",
        prodi: reg.prodi_pil_name ?? "-",
        kelasKuliah: mapKelas(reg.waktu_kuliah),
        namaBeasiswa: mapBeasiswa(reg.batchName ?? gel?.batch_name ?? ""),

        // dari gelombang JOIN
        gelombang: gel?.batch_name ?? reg.batchName ?? "-",
        tahunAkademik: gel?.academic_year ?? "2025/2026",
        tempatUjian: gel?.location ?? "Online",
        tanggalUjian: gel?.event_date ? formatTanggalIndo(gel.event_date) : "-",

        // TODO: tambah kolom ke DB untuk bank/deadline — sementara hardcode
        namaBank: "OCBC Bank",
        noRekening: "1222000922520068",
        atasNama: reg.nama ?? "Universitas Internasional Batam",
        tanggalDeadline: "-",
        tanggalSurat: today,
        cicilanDeadline: "-",
    };

    const html = generateLoaHtml(loaData);

    return new NextResponse(html, {
        status: 200,
        headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "no-store",
        },
    });
}
