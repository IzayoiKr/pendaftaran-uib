import '@/styles/ProgressBar.scss';
import '@/styles/form.scss';
import BatchRegistrationForm from "@/pages/BatchRegistration/BatchRegistrationForm";
import { type EventType, programTypeSchema } from "@/validation/schemaform";
import { notFound } from "next/navigation";
import type { Event } from '@/types/api';

interface PageProps {
    params: Promise<{ registrationKey: string }>;
    searchParams: Promise<{ nomorDaftar?: string }>;
}

async function fetchEvent(key: string): Promise<Event | null> {
    try {
        const res = await fetch(`${process.env.BACKEND_URL}/api/gelombang/${key}`, {
            next: { revalidate: 60 }
        });
        if (!res.ok) return null;
        return res.json();
    } catch (err) {
        console.error("Failed to fetch gelombang:", err);
        return null;
    }
}

export async function generateMetadata({ params }: PageProps) {
    const { registrationKey } = await params;
    return {
        title: `Register ${registrationKey} - UIB`,
        description: "Batch registration Universitas Internasional Batam"
    };
}

export default async function Page({ params, searchParams }: PageProps) {
    const { registrationKey } = await params;
    const { nomorDaftar } = await searchParams;
    if (!registrationKey) notFound();

    const eventData = await fetchEvent(registrationKey);

    const isEditMode = !!nomorDaftar;

    // Fallback logic if fetch fails or data is missing
    const isS2Fallback = registrationKey.toLowerCase().startsWith("s2") ||
        registrationKey.toLowerCase().startsWith("magister");

    const rawProgramType = eventData?.program_type || (isS2Fallback ? "Program Magister" : "Program Sarjana");

    const event: EventType = {
        id: registrationKey,
        batchName: eventData?.batch_name || "Gelombang 1",
        programType: programTypeSchema.parse(rawProgramType),
    };

    return (
        <BatchRegistrationForm
            registrationKey={registrationKey}
            event={event}
            nomorDaftar={nomorDaftar}
            isEditMode={isEditMode}
        />
    );
}
