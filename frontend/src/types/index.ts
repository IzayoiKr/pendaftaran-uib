import type { ReactNode } from "react";

export interface HeaderNavLinks {
    to: string;
    label: string;
    hashId?: string;
}

export interface FooterNavLinks {
    to: string;
    label: string;
}

export interface ContactInfo {
    university: string;
    address: string;
    phone: string;
    fax: string;
    email: string;
    line: string;
}

interface SocialLinks {
    name: string;
    url: string;
}

export interface ExternalLinks {
    mapEmbedUrl: string;
    socials: SocialLinks[];
}

export interface Hero {
    title: string;
    description: string;
    registrationButtonDesc: string;
    academicButtonDesc: string;
}

export interface Program {
    id: string;
    title: string;
    faculty: string;
    degree: 'S1' | 'S2';
    description: string;
    image: string;
    link: string;
}

export interface Event {
    id: string;
    image: string;
    programType: string;      // e.g., "Program Sarjana"
    programTypeEn: string;    // "Undergraduate Program"
    academicYear: string;     // "T.A 2026/2027"
    date: string;             // "09 May"
    time: string;             // "09:00 - 13:00"
    location: string;         // "Batam" or "Online"
    batchName: string;        // "Gelombang 2 Beasiswa-S1 Kedokteran"
    registrationStart: string;
    registrationEnd: string;
    registerLink: string;
}

export interface Feature {
    icon: string;
    title: string;
    description: string;
    link: string;
}

