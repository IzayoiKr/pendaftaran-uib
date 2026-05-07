import BatchRegistrationForm from "@/pages/BatchRegistration/BatchRegistrationForm";

import {
  type EventType,
  programTypeSchema,
} from "@/validation/schemaform";

import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    registrationKey: string;
  }>;

  searchParams: Promise<{
    nomorDaftar?: string;
  }>;
}

export async function generateMetadata({
  params,
}: PageProps) {
  const { registrationKey } =
    await params;

  return {
    title:
      `Register ${registrationKey} - UIB`,

    description:
      "Batch registration Universitas Internasional Batam",
  };
}

export default async function Page({
  params,
  searchParams,
}: PageProps) {

  /* ================= PARAMS ================= */

  const { registrationKey } =
    await params;

  const {
    nomorDaftar,
  } = await searchParams;

  if (!registrationKey) {
    notFound();
  }

  /* ================= EDIT MODE ================= */

  const isEditMode =
    !!nomorDaftar;

  /* ================= MOCK EVENT ================= */

  /**
   * Temporary mock logic:
   * s2xxxxx => Program Magister
   * others  => Program Sarjana
   *
   * TODO:
   * Replace with real API/database lookup.
   */

  const isS2 =
    registrationKey
      .toLowerCase()
      .startsWith("s2");

  const rawProgramType =
    isS2
      ? "Program Magister"
      : "Program Sarjana";

  const event: EventType = {
    id: registrationKey,

    batchName:
      "Gelombang 1",

    programType:
      programTypeSchema.parse(
        rawProgramType
      ),
  };

  /* ================= RENDER ================= */

  return (
    <BatchRegistrationForm
      registrationKey={
        registrationKey
      }
      event={event}

      nomorDaftar={
        nomorDaftar
      }

      isEditMode={
        isEditMode
      }
    />
  );
}