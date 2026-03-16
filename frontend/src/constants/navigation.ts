import type { NavLinks } from "../types"

export const navLinks: NavLinks[] = [
    { to: "/#home", label: "Beranda", hashId: "home" },
    { to: "/#gelombang", label: "Gelombang", hashId: "gelombang" },
    { to: "/info-umum", label: "Informasi Umum" },
    { to: "/#kontak", label: "Kontak", hashId: "kontak" },
    { to: "/panduan", label: "Panduan" },
    { to: "/login", label: "Daftar/Login" },
]

export const spyIds = navLinks
    .filter(l => l.hashId)
    .map(l => l.hashId as string);
