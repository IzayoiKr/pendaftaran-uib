export type PanduanIconName =
    | "ti-user-plus"
    | "ti-file-text"
    | "ti-edit"
    | "ti-upload"
    | "ti-circle-check"
    | "ti-refresh"
    | "ti-clipboard-list"
    | "ti-switch-horizontal";

export interface PanduanItem {
    id: string;
    step: number;
    titleKey: string;
    descriptionKey: string;
    pdfUrl: string;
    iconName: PanduanIconName;
}

export interface PanduanPhase {
    id: string;
    phaseNumber: number;
    phaseLabelKey: string;
    titleKey: string;
    subtitleKey: string;
    items: PanduanItem[];
}

export const panduanPhases: PanduanPhase[] = [
    {
        id: "registrasi",
        phaseNumber: 1,
        phaseLabelKey: "phase1.label",
        titleKey: "phase1.title",
        subtitleKey: "phase1.subtitle",
        items: [
            {
                id: "pembuatan-akun",
                step: 1,
                titleKey: "accountCreation.title",
                descriptionKey: "accountCreation.description",
                pdfUrl: "/docs/panduan/Pembuatan_Akun.pdf",
                iconName: "ti-user-plus",
            },
            {
                id: "pendaftaran",
                step: 2,
                titleKey: "registration.title",
                descriptionKey: "registration.description",
                pdfUrl: "/docs/panduan/Pendaftaran.pdf",
                iconName: "ti-file-text",
            },
            {
                id: "ubah-biodata",
                step: 3,
                titleKey: "profileUpdate.title",
                descriptionKey: "profileUpdate.description",
                pdfUrl: "/docs/panduan/Ubah_Biodata.pdf",
                iconName: "ti-edit",
            },
        ],
    },
    {
        id: "pembayaran",
        phaseNumber: 2,
        phaseLabelKey: "phase2.label",
        titleKey: "phase2.title",
        subtitleKey: "phase2.subtitle",
        items: [
            {
                id: "upload-bukti-transfer",
                step: 4,
                titleKey: "uploadTransferProof.title",
                descriptionKey: "uploadTransferProof.description",
                pdfUrl: "/docs/panduan/Upload_Bukti_Transfer.pdf",
                iconName: "ti-upload",
            },
            {
                id: "verifikasi-pembayaran",
                step: 5,
                titleKey: "paymentVerification.title",
                descriptionKey: "paymentVerification.description",
                pdfUrl: "/docs/panduan/Verifikasi_Pembayaran.pdf",
                iconName: "ti-circle-check",
            },
        ],
    },
    {
        id: "finalisasi",
        phaseNumber: 3,
        phaseLabelKey: "phase3.label",
        titleKey: "phase3.title",
        subtitleKey: "phase3.subtitle",
        items: [
            {
                id: "daftar-ulang",
                step: 6,
                titleKey: "reRegistration.title",
                descriptionKey: "reRegistration.description",
                pdfUrl: "/docs/panduan/Daftar_Ulang.pdf",
                iconName: "ti-refresh",
            },
            {
                id: "syarat-ospek",
                step: 7,
                titleKey: "orientationRequirement.title",
                descriptionKey: "orientationRequirement.description",
                pdfUrl: "/docs/panduan/Syarat_Ospek.pdf",
                iconName: "ti-clipboard-list",
            },
            {
                id: "pindah-prodi",
                step: 8,
                titleKey: "studyProgramTransfer.title",
                descriptionKey: "studyProgramTransfer.description",
                pdfUrl: "/docs/panduan/Permintaan_Pindah_Prodi.pdf",
                iconName: "ti-switch-horizontal",
            },
        ],
    },
];
