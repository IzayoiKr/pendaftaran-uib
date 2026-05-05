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

// Use snake case to match json type
export interface Program {
    id: string;
    title: string;
    faculty: string;
    degree: 'S1' | 'S2';
    description: string;
    image_path: string;
    link: string;
}

// Use snake case to match json type
export interface Event {
    id: string;
    batch_key: string;
    batch_name: string;
    program_type: string;
    program_type_en: string;
    academic_year: string;
    image_path: string;
    day: string;
    month: string;
    start_time: string;
    end_time: string;
    location: 'Batam' | 'Online' | 'Tanjung Pinang';
    registration_start: string;
    registration_start_display: string;
    registration_end: string;
    registration_end_display: string;
    register_link: string;
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
    full_name: string;
    nik: string;
    email: string;
    email_verified: boolean;
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
    image: string;
    author: string;
    date: string;
    category: string;
    detailLink: string;
}
