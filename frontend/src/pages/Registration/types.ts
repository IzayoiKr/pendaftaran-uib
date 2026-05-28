import { JENIS_DAFTAR, WAKTU_KULIAH } from "./valueOptions";

export interface SelectOption<T = string | number> {
    value: T;
    label: string;
}

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
    // ── Identity / S1 ─────────────────────────────────────────────────────────
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

    // ── Education / S1 ────────────────────────────────────────────────────────
    schoolOrigin: string;
    majorChoice: string;
    waktuKuliah: string | null;
    highschoolGpa: string;
    highschoolGraduateYear: string;

    // ── Biodata / S2 ──────────────────────────────────────────────────────────
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

    // ── Parents / S2 ─────────────────────────────────────────────────────────
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

    // ── Documents / S1 ───────────────────────────────────────────────────────
    pp: File | null;
    ktp: File | null;
    kk: File | null;
    transkripNilai: File | null;
    ijazahDok: File | null;
    // S1 Beasiswa
    sktmKip: File | null;
    fotoRumah: File | null;
    tagihanListrik: File | null;
    tagihanAir: File | null;
    sertifikatPrestasi: File | null;
    rapot1: File | null;
    rapot2: File | null;
    rapot3: File | null;
    rapot4: File | null;
    // S2
    al: File | null;
    r1: File | null;
    r4: File | null;

    // ── Payment ───────────────────────────────────────────────────────────────
    accountHolder: string;
    bank: string;
    paymentProof: File | null;

    // ── Declarations ──────────────────────────────────────────────────────────
    confirmation: boolean;
    pernyataan: boolean;
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
    r4: null,
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
