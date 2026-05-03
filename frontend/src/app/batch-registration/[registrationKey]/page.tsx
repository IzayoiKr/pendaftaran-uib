// app/batch-registration/[registrationKey]/page.tsx
import BatchRegistrationForm from "@/pages/BatchRegistration/BatchRegistrationForm";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ registrationKey: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { registrationKey } = await params;
  return {
    title: `Register ${registrationKey} - UIB`,
    description: "Batch registration Universitas Internasional Batam",
  };
}

export default async function Page({ params }: PageProps) {
  const { registrationKey } = await params; // ✅ await because Next.js 15

  if (!registrationKey) notFound();

  const isS2 = registrationKey.toLowerCase().startsWith("s2");

  const event = {
    id: registrationKey,
    batchName: "Gelombang 1",
    programType: isS2 ? "Program Magister" : "Program Sarjana",
  };

  return <BatchRegistrationForm registrationKey={registrationKey} event={event} />;
}