'use client';

// src/utils/downloadPdf.ts

import useAuthStore from "@/store/useAuthStore";

// ─── Core fetch dengan Authorization header ───────────────────────────────────
async function fetchProtected(endpoint: string): Promise<Response> {
    const token = useAuthStore.getState().accessToken ?? "";
    return fetch(endpoint, {
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
}

// ─── Download file statis (VA, pengunduran, contoh pasphoto, qris) ────────────
// Route handler: src/app/api/files/[filename]/route.ts
// URL: /api/files/:key — ini TIDAK kena rewrite karena ada route handler-nya
export async function downloadStaticPdf(key: string, filename: string): Promise<void> {
    const res = await fetchProtected(`/api/files/${encodeURIComponent(key)}`);

    if (res.status === 401) { window.location.href = "/login"; return; }
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Gagal mengunduh: ${filename}`);
    }

    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement("a"), { href: url, download: filename });
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

// ─── Buka Surat Hasil (LoA) di tab baru ──────────────────────────────────────
// Route handler: src/app/surat-hasil/[nomorDaftar]/route.ts
// URL: /surat-hasil/:nomorDaftar — BUKAN /api/ sehingga TIDAK kena rewrite
// Fetch dulu HTML-nya pakai Authorization header, lalu buka sebagai blob di tab baru.
// User klik tombol Print → Save as PDF.
export async function downloadSuratHasil(nomorDaftar: string): Promise<void> {
    const res = await fetchProtected(
        `/surat-hasil/${encodeURIComponent(nomorDaftar)}`
    );

    if (res.status === 401) { window.location.href = "/login"; return; }
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "Gagal membuka surat hasil");
    }

    const html = await res.text();
    const blob = new Blob([html], { type: "text/html; charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    const tab  = window.open(url, "_blank", "noopener,noreferrer");

}