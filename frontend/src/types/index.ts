export interface NavLinks {
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
    instagram: string;
    youtube: string;
    pengumumanLink: string;
    mapEmbedUrl: string;
}

export interface Header {
    image: string;
}

export interface Footer {
    pengumumanLink: string;
    address: string;
    phone: string;
    fax: string;
    email: string;
    maps: string;
    lineLink: string;
    instagramLink: string;
    youtubeLink: string;
    eserviceUIBLink: string;
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
    id: string;
    icon: string;            // class name like "flaticon-student"
    title: string;
    description: string;
    link: string;
}

