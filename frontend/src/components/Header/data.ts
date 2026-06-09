export const headerNavLinks = [
    { to: "/#home", labelKey: "home", hashId: "home" },
    { to: "/#gelombang", labelKey: "gelombang", hashId: "gelombang" },
    { to: "/info-umum", labelKey: "infoUmum", hashId: undefined },
    { to: "#contact", labelKey: "kontak", hashId: "contact" },
    { to: "/panduan", labelKey: "panduan", hashId: undefined },
    { to: "/login", labelKey: "login", hashId: undefined },
] as const;

export const spyIds = headerNavLinks
    .filter((l) => l.hashId)
    .map((l) => l.hashId as string);
