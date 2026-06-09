import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { infoList } from "@/constants/infoUmum";
import InfoDetail from "@/pages/InfoUmum/InfoDetail";
import { infoDetailModules } from "@/pages/InfoUmum/InfoDetails";

interface Props {
    params: Promise<{
        id: string;
    }>;
}

export async function generateStaticParams() {
    return infoList.map((post) => ({
        id: post.id,
    }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;

    const post = infoList.find((p) => p.id === id);

    if (!post) {
        return {};
    }

    return {
        title: "Universitas Internasional Batam",

        openGraph: {
            images: [
                {
                    url: post.image,
                },
            ],
        },
    };
}

function loadContent(id: string) {
    return infoDetailModules[id as keyof typeof infoDetailModules] || null;
}

export default async function InfoDetailPage({ params }: Props) {
    const { id } = await params;

    const meta = infoList.find((p) => p.id === id);

    if (!meta) {
        notFound();
    }

    const content = loadContent(id);

    if (!content) {
        notFound();
    }

    return <InfoDetail post={meta} Content={content.Content} />;
}
