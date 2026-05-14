import type { ChangeEvent } from "react";

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
    autoComplete?: string;
    required?: boolean;
    readOnly?: boolean;
    minLength?: number;
    maxLength?: number;
    value?: string;
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}

export interface BlogPost {
    id: number;
    title: string;
    description: string;
    image: string;
    author: string;
    date: string;
    category: string;
    detailLink: string;
}
