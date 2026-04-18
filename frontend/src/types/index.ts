import type { StaticImageData } from "next/image";

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
    image: StaticImageData;
    link: string;
}

export interface Event {
    id: string;
    image: StaticImageData;
    programType: string;
    programTypeEn: string;
    academicYear: string;
    day: string;
    month: string;
    startTime: string;
    endTime: string;
    location: string;
    batchName: string;
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

export interface Guide {
    id: string;
    title: string;
    description: string;
    embedUrl: string
}

export interface Form {
    name: string;
    label?: string;
    type: "text" | "email" | "password";
    placeholder?: string;
    autoComplete: string;
    minLength?: number;
    maxLength?: number;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface User {
    id: string;
    full_name: string;
    nik: string;
    email: string;
}

export interface AuthState {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

export interface AccessTokenResponse {
    access_token: string;
    user: User;
}

export interface BlogPost {
    id: number;
    title: string;
    description: string;
    image: StaticImageData;
    author: string;
    date: string;
    category: string;
    detailLink: string;
}
