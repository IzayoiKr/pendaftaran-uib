'use client';

// src/utils/downloadPdf.ts
// Utility terpusat untuk download PDF dari protected Route Handler.
// Surat Hasil → buka tab baru (user Ctrl+P / Save as PDF sendiri)
// File statis → trigger download langsung

export async function downloadPdf(endpoint: string, filename: string): Promise<void> {
    const res = await fetch(endpoint, { credentials: "include" });

    if (res.status === 401) {
        window.location.href = "/login";
        return;
    }

    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? `Gagal mengunduh: ${filename}`);
    }

    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement("a"), { href: url, download: filename });
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

/**
 * Download file statis dari /api/files/:key
 * Contoh: downloadStaticPdf("VA", "panduan-VA.pdf")
 *         downloadStaticPdf("pengunduran", "pengunduran.pdf")
 *         downloadStaticPdf("contoh_pasphoto", "contoh_pasphoto.pdf")
 *         downloadStaticPdf("panduanpenggunaanqris", "panduan-qris.pdf")
 */
export async function downloadStaticPdf(key: string, filename: string): Promise<void> {
    return downloadPdf(`/api/files/${encodeURIComponent(key)}`, filename);
}

/**
 * Buka Surat Hasil (LoA) di tab baru sebagai HTML.
 * User bisa Ctrl+P → Save as PDF dari browser.
 * Tidak perlu Puppeteer sama sekali.
 */
export function downloadSuratHasil(nomorDaftar: string): void {
    window.open(
        `/api/surat-hasil/${encodeURIComponent(nomorDaftar)}`,
        "_blank",
        "noopener,noreferrer"
    );
}