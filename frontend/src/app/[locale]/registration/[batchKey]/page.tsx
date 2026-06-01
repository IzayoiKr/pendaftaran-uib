import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Registration from "@/pages/Registration/Registration";
import Loading from "@/components/Loading/Loading";
import NotFound from "@/components/NotFound/NotFound";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string; batchKey: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({
        locale,
        namespace: "metadata.registration",
    });

    return {
        title: t("title"),
        description: t("description"),
    };
}

interface PageProps {
    params: Promise<{ batchKey: string; locale: string }>;
}

interface RegistrationInitData {
    batch_name: string;
    degree: "S1" | "S2";
    batch_type: "Reguler" | "Beasiswa";
    programs: Array<{ title: string; title_en: string }>;
    registration_fee: {
        bank_name: string;
        account_holder: string;
        account_number: string;
        amount: number;
    };
}

async function fetchRegistrationInit(
    batchKey: string,
): Promise<RegistrationInitData | null> {
    try {
        const res = await fetch(
            `${process.env.BACKEND_URL}/api/registrations/${batchKey}/init`,
            { cache: "no-store" },
        );
        if (res.status === 404) return null;
        if (!res.ok) throw new Error("Gagal memuat form pendaftaran");
        return await res.json();
    } catch {
        return null;
    }
}

export default async function RegistrationPage({ params }: PageProps) {
    const { batchKey } = await params;
    const init = await fetchRegistrationInit(batchKey);
    if (!init) {
        return <NotFound />;
    }

    const programType =
        init.degree === "S1" ? "Program Sarjana" : "Program Magister";
    const event = {
        programType,
        batchName: init.batch_name,
        batchType: init.batch_type,
    };

    const programOptions = init.programs.map((opt) => ({
        value: opt.title,
        label: `${opt.title} (${opt.title_en})`,
    }));

    const paymentConfig = {
        bank: init.registration_fee.bank_name,
        rekening: init.registration_fee.account_number,
        atasNama: init.registration_fee.account_holder,
        biayaDisplay: new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(init.registration_fee.amount),
        qrisPath: "/docs/panduan/panduan_penggunaan_qris.pdf",
    };

    return (
        <Suspense fallback={<Loading />}>
            <Registration
                batchKey={batchKey}
                degree={init.degree}
                event={event}
                programOptions={programOptions}
                paymentConfig={paymentConfig}
            />
        </Suspense>
    );
}
