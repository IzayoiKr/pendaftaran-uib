import { JENIS_DAFTAR, WAKTU_KULIAH } from "./valueOptions";

export interface SelectOption<T = string | number> {
    value: T;
    label: string;
}

export type DocumentField = File | string | null;

export interface DocConfig {
    name: string;
    label: string;
    section: "Personal" | "Study";
    required: boolean;
    condition?: "transferOrAlih";
}

export interface PaymentConfig {
    bank: string;
    rekening: string;
    atasNama: string;
    biayaDisplay: string;
    qrisPath: string;
}

export type JenisDaftar = (typeof JENIS_DAFTAR)[keyof typeof JENIS_DAFTAR];
export type WaktuKuliah = (typeof WAKTU_KULIAH)[keyof typeof WAKTU_KULIAH];

export type ParentType = "Father" | "Mother";

export interface ParentSectionConfig {
    type: ParentType;
    title: string;
    fields: Record<string, string>;
    labels: Record<string, string>;
}

export type SectionStatus = "empty" | "partial" | "complete";

export interface RegistrationFormValues {
    jenisdaftar: string | null;
    gender: string;
    citizenship: string;
    birthPlace: string;
    birthDate: string;
    phoneNumber: string;
    whatsappNumber: string;
    previousUniversity: string;
    previousMajor: string;
    gpa: string;
    highestEducation: string;

    schoolOrigin: string;
    majorChoice: string;
    waktuKuliah: string | null;
    highschoolGpa: string;
    highschoolGraduateYear: string;

    contactEmail: string;
    religion: string;
    fundingSource: string;
    address: string;
    subDistrict: string;
    district: string;
    hamlet: string;
    postalCode: string;
    rt: string;
    rw: string;
    degree: string;
    taxID: string;
    reference: string;
    expertField: string;
    companyName: string;
    companyAddress: string;
    position: string;
    companyStatus: string;
    companyStartYear: string;

    fatherNik: string;
    fatherName: string;
    fatherBirthdate: string;
    fatherPhone: string;
    fatherEducation: string;
    fatherOccupation: string;
    fatherIncome: string;
    fatherStatus: string;
    motherNik: string;
    motherName: string;
    motherBirthdate: string;
    motherPhone: string;
    motherEducation: string;
    motherOccupation: string;
    motherIncome: string;
    motherStatus: string;
    parentsAddress: string;

    pp: DocumentField;
    ktp: DocumentField;
    kk: DocumentField;
    transkripNilai: DocumentField;
    ijazahDok: DocumentField;
    sktmKip: DocumentField;
    fotoRumah: DocumentField;
    tagihanListrik: DocumentField;
    tagihanAir: DocumentField;
    sertifikatPrestasi: DocumentField;
    rapot1: DocumentField;
    rapot2: DocumentField;
    rapot3: DocumentField;
    rapot4: DocumentField;
    al: DocumentField;
    r1: DocumentField;
    r2: DocumentField;

    accountHolder: string;
    bank: string;
    paymentProof: DocumentField;

    confirmation: boolean;
    pernyataan: boolean;
}

export function hasDocument(value: DocumentField): boolean {
    return value !== null && value !== undefined;
}

export function getDocumentDisplay(
    value: DocumentField,
): { name: string; size: number } | null {
    if (value === null || value === undefined) return null;
    if (value instanceof File) {
        return { name: value.name, size: value.size };
    }
    const parts = value.split("|");
    if (parts.length === 2) {
        return { name: parts[0], size: parseInt(parts[1], 10) };
    }
    return null;
}

export function isNewUpload(value: DocumentField): value is File {
    return value instanceof File;
}

export function isExistingDoc(value: DocumentField): value is string {
    return typeof value === "string" && value.includes("|");
}

export const REGISTRATION_DEFAULT_VALUES: RegistrationFormValues = {
    jenisdaftar: null,
    gender: "",
    citizenship: "",
    birthPlace: "",
    birthDate: "",
    phoneNumber: "",
    whatsappNumber: "",
    previousUniversity: "",
    previousMajor: "",
    gpa: "",
    highestEducation: "",
    schoolOrigin: "",
    majorChoice: "",
    waktuKuliah: null,
    highschoolGpa: "",
    highschoolGraduateYear: "",
    contactEmail: "",
    religion: "",
    fundingSource: "",
    address: "",
    subDistrict: "",
    district: "",
    hamlet: "",
    postalCode: "",
    rt: "",
    rw: "",
    degree: "",
    taxID: "",
    reference: "",
    expertField: "",
    companyName: "",
    companyAddress: "",
    position: "",
    companyStatus: "",
    companyStartYear: "",
    fatherNik: "",
    fatherName: "",
    fatherBirthdate: "",
    fatherPhone: "",
    fatherEducation: "",
    fatherOccupation: "",
    fatherIncome: "",
    fatherStatus: "",
    motherNik: "",
    motherName: "",
    motherBirthdate: "",
    motherPhone: "",
    motherEducation: "",
    motherOccupation: "",
    motherIncome: "",
    motherStatus: "",
    parentsAddress: "",
    pp: null,
    ktp: null,
    kk: null,
    transkripNilai: null,
    ijazahDok: null,
    sktmKip: null,
    fotoRumah: null,
    tagihanListrik: null,
    tagihanAir: null,
    sertifikatPrestasi: null,
    rapot1: null,
    rapot2: null,
    rapot3: null,
    rapot4: null,
    al: null,
    r1: null,
    r2: null,
    accountHolder: "",
    bank: "",
    paymentProof: null,
    confirmation: false,
    pernyataan: false,
};

export interface RegistrationFormProps {
    degree: "S1" | "S2";
    event: {
        programType: string;
        batchName: string;
        batchType: "Beasiswa" | "Reguler";
    };
    programOptions: Array<{ value: string; label: string }>;
    paymentConfig: {
        bank: string;
        rekening: string;
        atasNama: string;
        biayaDisplay: string;
        qrisPath: string;
    };
}
