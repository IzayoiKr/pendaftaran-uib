'use client';


// Utility terpusat untuk trigger download PDF dari protected Route Handler.
// Semua component cukup import dari sini — tidak perlu tulis logic fetch sendiri.

export async function downloadPdf(endpoint: string, filename: string): Promise<void> {
    const res = await fetch(endpoint, { credentials: "include" });

    if (res.status === 401) {
        window.location.href = "/login";
        return;
    }

    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
            (data as { error?: string }).error ?? `Gagal mengunduh: ${filename}`
        );
    }

    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement("a"), {
        href:     url,
        download: filename,
    });
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

// ─── Shorthand helpers (pakai ini di component) ───────────────────────────────

/**
 * Download file statis dari /api/files/:key
 * Contoh: downloadStaticPdf("VA", "panduan-VA.pdf")
 *         downloadStaticPdf("pengunduran-diri", "pengunduran-diri.pdf")
 *         downloadStaticPdf("contoh-pasfoto", "contoh_pasfoto.jpg")
 */
export async function downloadStaticPdf(key: string, filename: string): Promise<void> {
    return downloadPdf(`/api/files/${encodeURIComponent(key)}`, filename);
}

/**
 * Download Surat Hasil (LoA) yang di-generate server-side per nomorDaftar.
 * Route: GET /api/surat-hasil/:nomorDaftar
 * Browser akan membuka HTML LoA → user bisa print/save sebagai PDF.
 */
export async function downloadSuratHasil(nomorDaftar: string): Promise<void> {
    // Buka di tab baru agar user bisa Ctrl+P / Save as PDF
    window.open(
        `/api/surat-hasil/${encodeURIComponent(nomorDaftar)}`,
        "_blank",
        "noopener,noreferrer"
    );
}