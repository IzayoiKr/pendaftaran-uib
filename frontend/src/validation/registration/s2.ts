import { z } from "zod";
import {
    type TV,
    agamaValues,
    finalDeclarationFields,
    kewarganegaraanValues,
    optBoolean,
    optDate,
    optEmail,
    optEnum,
    optGpa,
    optPdf,
    optPhone,
    optString,
    optYear,
    paymentDraftFields,
    paymentFields,
    pekerjaanValues,
    pendidikanValues,
    penghasilanValues,
    reqDate,
    reqEmail,
    reqEnum,
    reqGpa,
    reqPdf,
    reqPhone,
    reqString,
    statusInstansiValues,
    statusOrangTuaValues,
    sumberBiayaValues,
    validateGpaString,
} from "./shared";

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_MIN_KERJA = CURRENT_YEAR - 44;
const YEAR_MAX_KERJA = CURRENT_YEAR;

export const s2DraftSchema = (t: TV) =>
    z
        .object({
            citizenship: optEnum(t, "citizenship", kewarganegaraanValues),
            birthPlace: optString(t, "birthPlace", 100),
            birthDate: optDate(t, "birthDate"),
            contactEmail: optEmail(t, "contactEmail"),
            phoneNumber: optPhone(t, "phoneNumber"),
            religion: optEnum(t, "religion", agamaValues),
            fundingSource: optEnum(t, "fundingSource", sumberBiayaValues),

            taxID: optString(t, "taxID", 20),
            reference: optString(t, "reference", 255),
            expertField: optString(t, "expertField", 150),

            address: optString(t, "address", 500),
            subDistrict: optString(t, "subDistrict", 100),
            district: optString(t, "district", 100),
            hamlet: optString(t, "hamlet", 100),
            postalCode: optString(t, "postalCode", 12),
            rt: optString(t, "rt", 5),
            rw: optString(t, "rw", 5),

            previousMajor: optString(t, "previousMajor", 100),
            gpa: optGpa(t, "gpa"),
            degree: optString(t, "degree", 50),
            previousUniversity: optString(t, "previousUniversity", 150),

            companyName: optString(t, "companyName", 150),
            companyAddress: optString(t, "companyAddress", 500),
            position: optString(t, "position", 100),
            companyStatus: optEnum(t, "companyStatus", statusInstansiValues),
            companyStartYear: optYear(
                t,
                "companyStartYear",
                YEAR_MIN_KERJA,
                YEAR_MAX_KERJA,
            ),

            majorChoice: optString(t, "majorChoice", 100),

            fatherName: optString(t, "fatherName", 255),
            fatherPhone: optPhone(t, "fatherPhone"),
            fatherNik: optString(t, "fatherNik", 20),
            fatherBirthdate: optDate(t, "fatherBirthdate"),
            fatherEducation: optEnum(t, "fatherEducation", pendidikanValues),
            fatherOccupation: optEnum(t, "fatherOccupation", pekerjaanValues),
            fatherIncome: optEnum(t, "fatherIncome", penghasilanValues),
            fatherStatus: optEnum(t, "fatherStatus", statusOrangTuaValues),

            motherName: optString(t, "motherName", 255),
            motherPhone: optPhone(t, "motherPhone"),
            motherNik: optString(t, "motherNik", 20),
            motherBirthdate: optDate(t, "motherBirthdate"),
            motherEducation: optEnum(t, "motherEducation", pendidikanValues),
            motherOccupation: optEnum(t, "motherOccupation", pekerjaanValues),
            motherIncome: optEnum(t, "motherIncome", penghasilanValues),
            motherStatus: optEnum(t, "motherStatus", statusOrangTuaValues),

            parentsAddress: optString(t, "parentsAddress", 500),

            al: optPdf(t, "al"),
            kk: optPdf(t, "kk"),
            pp: optPdf(t, "pp"),
            ktp: optPdf(t, "ktp"),
            r1: optPdf(t, "r1"),
            r4: optPdf(t, "r4"),

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

export const s2SubmitSchema = (t: TV) =>
    z
        .object({
            citizenship: reqEnum(t, "citizenship", kewarganegaraanValues),
            birthPlace: reqString(t, "birthPlace", 100),
            birthDate: reqDate(t, "birthDate"),
            contactEmail: reqEmail(t, "contactEmail"),
            phoneNumber: reqPhone(t, "phoneNumber"),
            religion: reqEnum(t, "religion", agamaValues),
            fundingSource: reqEnum(t, "fundingSource", sumberBiayaValues),

            taxID: optString(t, "taxID", 20),
            reference: optString(t, "reference", 255),
            expertField: optString(t, "expertField", 150),

            address: reqString(t, "address", 500),
            subDistrict: reqString(t, "subDistrict", 100),
            district: reqString(t, "district", 100),

            hamlet: optString(t, "hamlet", 100),
            postalCode: optString(t, "postalCode", 12),
            rt: optString(t, "rt", 5),
            rw: optString(t, "rw", 5),

            previousMajor: reqString(t, "previousMajor", 100),
            gpa: reqGpa(t, "gpa"),
            degree: reqString(t, "degree", 50),
            previousUniversity: reqString(t, "previousUniversity", 150),

            companyName: optString(t, "companyName", 150),
            companyAddress: optString(t, "companyAddress", 500),
            position: optString(t, "position", 100),
            companyStatus: optEnum(t, "companyStatus", statusInstansiValues),
            companyStartYear: optYear(
                t,
                "companyStartYear",
                YEAR_MIN_KERJA,
                YEAR_MAX_KERJA,
            ),

            majorChoice: reqString(t, "majorChoice", 100),

            fatherName: reqString(t, "fatherName", 255),
            fatherPhone: reqPhone(t, "fatherPhone"),

            fatherNik: optString(t, "fatherNik", 20),
            fatherBirthdate: optDate(t, "fatherBirthdate"),
            fatherEducation: optEnum(t, "fatherEducation", pendidikanValues),
            fatherOccupation: optEnum(t, "fatherOccupation", pekerjaanValues),
            fatherIncome: optEnum(t, "fatherIncome", penghasilanValues),
            fatherStatus: optEnum(t, "fatherStatus", statusOrangTuaValues),

            motherName: reqString(t, "motherName", 255),
            motherPhone: reqPhone(t, "motherPhone"),

            motherNik: optString(t, "motherNik", 20),
            motherBirthdate: optDate(t, "motherBirthdate"),
            motherEducation: optEnum(t, "motherEducation", pendidikanValues),
            motherOccupation: optEnum(t, "motherOccupation", pekerjaanValues),
            motherIncome: optEnum(t, "motherIncome", penghasilanValues),
            motherStatus: optEnum(t, "motherStatus", statusOrangTuaValues),

            parentsAddress: optString(t, "parentsAddress", 500),

            al: reqPdf(t, "al"),
            kk: reqPdf(t, "kk"),
            pp: reqPdf(t, "pp"),
            ktp: reqPdf(t, "ktp"),
            r1: reqPdf(t, "r1"),
            r4: reqPdf(t, "r4"),

            ...paymentFields(t),

            ...finalDeclarationFields(t),
        })
        .superRefine((data, ctx) => {
            validateGpaString(data.gpa, ctx, "gpa", t);
        });

export type S2Draft = z.infer<ReturnType<typeof s2DraftSchema>>;
export type S2Submit = z.infer<ReturnType<typeof s2SubmitSchema>>;
