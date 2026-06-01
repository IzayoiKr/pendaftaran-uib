import { z } from "zod";
import {
    type TV,
    finalDeclarationFields,
    jenisDaftarValues,
    jenisKelaminValues,
    jenjangPendidikanValues,
    kewarganegaraanValues,
    optBoolean,
    optDate,
    optEnum,
    optGpa,
    optHsGpa,
    optDoc,
    optPhone,
    optString,
    optYear,
    paymentDraftFields,
    paymentFields,
    reqDate,
    reqEnum,
    reqDoc,
    reqPhone,
    reqString,
    validateGpaString,
    validateRequiredFile,
    validateRequiredString,
    waktuKuliahValues,
} from "./shared";

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_MIN_SMA = CURRENT_YEAR - 24;
const YEAR_MAX_SMA = CURRENT_YEAR;

export const s1DraftSchema = (t: TV) =>
    z
        .object({
            jenisdaftar: optEnum(t, "jenisdaftar", jenisDaftarValues),
            gender: optEnum(t, "gender", jenisKelaminValues),
            citizenship: optEnum(t, "citizenship", kewarganegaraanValues),
            birthPlace: optString(t, "birthPlace", 100),
            birthDate: optDate(t, "birthDate"),
            phoneNumber: optPhone(t, "phoneNumber"),
            whatsappNumber: optPhone(t, "whatsappNumber"),

            previousUniversity: optString(t, "previousUniversity", 100),
            previousMajor: optString(t, "previousMajor", 100),
            gpa: optGpa(t, "gpa"),
            highestEducation: optEnum(
                t,
                "highestEducation",
                jenjangPendidikanValues,
            ),

            schoolOrigin: optString(t, "schoolOrigin", 100),
            majorChoice: optString(t, "majorChoice", 100),
            waktuKuliah: optEnum(t, "waktuKuliah", waktuKuliahValues),

            highschoolGpa: optHsGpa(t, "highschoolGpa"),
            highschoolGraduateYear: optYear(
                t,
                "highschoolGraduateYear",
                YEAR_MIN_SMA,
                YEAR_MAX_SMA,
            ),

            confirmation: optBoolean(),

            pp: optDoc(t, "pp"),
            ktp: optDoc(t, "ktp"),
            kk: optDoc(t, "kk"),
            transkripNilai: optDoc(t, "transkripNilai"),
            ijazahDok: optDoc(t, "ijazahDok"),
            sktmKip: optDoc(t, "sktmKip"),
            fotoRumah: optDoc(t, "fotoRumah"),
            tagihanListrik: optDoc(t, "tagihanListrik"),
            tagihanAir: optDoc(t, "tagihanAir"),
            sertifikatPrestasi: optDoc(t, "sertifikatPrestasi"),
            rapot1: optDoc(t, "rapot1"),
            rapot2: optDoc(t, "rapot2"),
            rapot3: optDoc(t, "rapot3"),
            rapot4: optDoc(t, "rapot4"),

            ...paymentDraftFields(t),

            pernyataan: optBoolean(),
        })
        .refine(
            (data) =>
                Object.values(data).some(
                    (v) =>
                        v !== undefined &&
                        v !== "" &&
                        v !== null &&
                        !(v === false),
                ),
            { error: t("registration.atLeastOneRequired") },
        );

export const s1SubmitSchema = (t: TV) =>
    z
        .object({
            gender: reqEnum(t, "gender", jenisKelaminValues),
            citizenship: reqEnum(t, "citizenship", kewarganegaraanValues),
            birthPlace: reqString(t, "birthPlace", 100),
            birthDate: reqDate(t, "birthDate"),
            phoneNumber: reqPhone(t, "phoneNumber"),
            whatsappNumber: reqPhone(t, "whatsappNumber"),
            jenisdaftar: reqEnum(t, "jenisdaftar", jenisDaftarValues),

            previousUniversity: optString(t, "previousUniversity", 100),
            previousMajor: optString(t, "previousMajor", 100),
            gpa: optGpa(t, "gpa"),
            highestEducation: optEnum(
                t,
                "highestEducation",
                jenjangPendidikanValues,
            ),

            schoolOrigin: reqString(t, "schoolOrigin", 100),
            majorChoice: reqString(t, "majorChoice", 100),
            waktuKuliah: reqEnum(t, "waktuKuliah", waktuKuliahValues),

            highschoolGpa: optHsGpa(t, "highschoolGpa"),
            highschoolGraduateYear: optYear(
                t,
                "highschoolGraduateYear",
                YEAR_MIN_SMA,
                YEAR_MAX_SMA,
            ),

            confirmation: optBoolean(),

            pp: reqDoc(t, "pp"),
            ktp: reqDoc(t, "ktp"),
            kk: reqDoc(t, "kk"),
            transkripNilai: optDoc(t, "transkripNilai"),
            ijazahDok: optDoc(t, "ijazahDok"),
            sktmKip: optDoc(t, "sktmKip"),
            fotoRumah: optDoc(t, "fotoRumah"),
            tagihanListrik: optDoc(t, "tagihanListrik"),
            tagihanAir: optDoc(t, "tagihanAir"),
            sertifikatPrestasi: optDoc(t, "sertifikatPrestasi"),
            rapot1: optDoc(t, "rapot1"),
            rapot2: optDoc(t, "rapot2"),
            rapot3: optDoc(t, "rapot3"),
            rapot4: optDoc(t, "rapot4"),

            ...paymentFields(t),

            ...finalDeclarationFields(t),
        })
        .superRefine((data, ctx) => {
            const isTransferAlih =
                data.jenisdaftar === "ALIH_JENJANG" ||
                data.jenisdaftar === "TRANSFER";

            if (isTransferAlih) {
                validateRequiredString(
                    data.previousUniversity,
                    ctx,
                    "previousUniversity",
                    t("registration.previousUniversityRequired"),
                );
                validateRequiredString(
                    data.previousMajor,
                    ctx,
                    "previousMajor",
                    t("registration.previousMajorRequired"),
                );
                validateGpaString(data.gpa, ctx, "gpa", t);
                if (!data.highestEducation) {
                    ctx.addIssue({
                        code: "custom",
                        path: ["highestEducation"],
                        message: t("registration.highestEducationRequired"),
                    });
                }
                validateRequiredFile(
                    data.transkripNilai,
                    ctx,
                    "transkripNilai",
                    t("registration.transkripNilaiRequired"),
                );
                validateRequiredFile(
                    data.ijazahDok,
                    ctx,
                    "ijazahDok",
                    t("registration.ijazahDokRequired"),
                );
            }

            if (data.jenisdaftar === "BARU") {
                if (data.confirmation !== true) {
                    ctx.addIssue({
                        code: "custom",
                        path: ["confirmation"],
                        message: t("registration.confirmationRequired"),
                    });
                }
            }
        });

export type S1Draft = z.infer<ReturnType<typeof s1DraftSchema>>;
export type S1Submit = z.infer<ReturnType<typeof s1SubmitSchema>>;
