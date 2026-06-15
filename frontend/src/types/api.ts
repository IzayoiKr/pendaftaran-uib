// Use snake case to match json type
export interface Program {
    id: string;
    title: string;
    faculty: string;
    degree: "S1" | "S2";
    description: string;
    image_path: string;
    link: string;
}

// Use snake case to match json type
export interface Event {
    id: string;
    batch_key: string;
    batch_name: string;
    degree: "S1" | "S2";
    academic_year: string;
    image_path: string;
    day: string;
    month: string;
    start_time: string;
    end_time: string;
    location: "Batam" | "Online" | "Tanjung Pinang";
    registration_start: string;
    registration_start_display: string;
    registration_end: string;
    registration_end_display: string;
    register_link: string;
}

export interface User {
    full_name: string;
    nik: string;
    email: string;
    email_verified: boolean;
}

export interface RegistrationCard {
    registration_id: string;
    status: "NONE" | "DRAFT" | "SUBMITTED" | "REJECTED" | "VERIFIED";
    batch_key: string;
    batch_name: string;
    degree: "S1" | "S2";
    batch_type: "Beasiswa" | "Reguler";
    academic_year: string;
    event_date: string;
    start_time: string;
    registration_end?: string;
    feedback_document?: string;
    feedback_payment?: string;
    examinee_id?: string;
    usm_password?: string;
}

export interface TuitionFee {
    id: number;
    status: string;
    pemilik_rekening: string;
    bank: string;
    amount: number;
    bukti_bayar_path: string;
    created_at: string;
}

export interface RegistrationDetailResponse {
    registration: RegistrationCard;
    payments?: TuitionFee[];
    ospek?: OspekPrerequisite;
    user: User;
    current_prodi?: string;
    current_session?: string;
}

export interface OspekPrerequisite {
    registration_id: string;
    pas_foto_path?: string;
    pas_foto_name?: string;
    ijazah_path?: string;
    ijazah_name?: string;
    status: string;
    notes?: string;
    uploaded_at: string;
}

export interface ProfileResponse extends User {
    registrations: RegistrationCard[];
}

export interface AuthState {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isLoggingOut: boolean;
}

export interface AccessTokenResponse {
    access_token: string;
    user: User;
}

export interface RegistrationResponse {
    message: string;
    status: string;
}

export interface ProgramChoice {
    code: string;
    title: string;
}

export interface ProdiRequestItem {
    id: string;
    request_date: string;
    previous_prodi: string;
    previous_shift: string;
    new_prodi: string;
    new_shift: string;
    status: string;
}

export interface ProdiInfoResponse {
    registration_id: string;
    batch_name: string;
    academic_year: string;
    current_prodi: string;
    current_shift: string;
    available_programs: ProgramChoice[];
    requests: ProdiRequestItem[];
}
