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
