import type { HeaderNavLinks, FooterNavLinks } from "../types"

export const headerNavLinks: HeaderNavLinks[] = [
    { to: "/#home", label: "Beranda", hashId: "home" },
    { to: "/#gelombang", label: "Gelombang", hashId: "gelombang" },
    { to: "/info-umum", label: "Informasi Umum" },
    { to: "#kontak", label: "Kontak", hashId: "kontak" },
    { to: "/panduan", label: "Panduan" },
    { to: "/login", label: "Daftar/Login" },
]

export const spyIds = headerNavLinks
    .filter(l => l.hashId)
    .map(l => l.hashId as string);

export const footerNavLinks: FooterNavLinks[] = [
    { to: "/#home", label: "Beranda" },
    { to: "/#gelombang", label: "Gelombang" },
    { to: "/info-umum", label: "Info Umum" },
    { to: "https://www.uib.ac.id/category/pengumuman/", label: "Pengumuman" },
    { to: "/login", label: "Daftar/Login" },
]
