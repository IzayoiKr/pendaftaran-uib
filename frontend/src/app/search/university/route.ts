import { NextRequest, NextResponse } from "next/server";

interface PddiktiPt {
    id: string;
    kode: string;
    nama_singkat: string;
    nama: string;
}

interface FormattedUniversityResult {
    value: string;
    label: string;
    country: string;
    source: "indonesia" | "global";
}

async function fetchPddikti(
    query: string,
): Promise<FormattedUniversityResult[]> {
    try {
        const res = await fetch(
            `https://pddikti.fastapicloud.dev/api/search/pt/universitas ${encodeURIComponent(query)}/`,
            { next: { revalidate: 86400 } },
        );
        if (!res.ok) return [];

        const data = await res.json();
        const pts: PddiktiPt[] = Array.isArray(data) ? data : [];

        return pts.map((pt) => ({
            value: pt.nama,
            label: `${pt.nama}${pt.nama_singkat ? ` (${pt.nama_singkat})` : ""} — Indonesia`,
            country: "ID",
            source: "indonesia",
        }));
    } catch {
        return [];
    }
}

interface OpenAlexInstitution {
    display_name: string;
    country_code: string;
    homepage_url: string;
}

async function fetchOpenAlex(
    query: string,
): Promise<FormattedUniversityResult[]> {
    try {
        const res = await fetch(
            `https://api.openalex.org/institutions?search=${encodeURIComponent(query)}&per_page=20`,
            { next: { revalidate: 86400 } },
        );
        if (!res.ok) return [];

        const data = await res.json();
        const institutions: OpenAlexInstitution[] = data.results || [];

        return institutions.map((inst) => ({
            value: inst.display_name,
            label: `${inst.display_name} (${inst.country_code})`,
            country: inst.country_code,
            source: "global" as const,
        }));
    } catch {
        return [];
    }
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();

    if (!q || q.length < 2) {
        return NextResponse.json({ results: [] });
    }

    try {
        const [pddiktiResults, openAlexResults] = await Promise.allSettled([
            fetchPddikti(q),
            fetchOpenAlex(q),
        ]);

        const indoResults =
            pddiktiResults.status === "fulfilled" ? pddiktiResults.value : [];
        const globalResults =
            openAlexResults.status === "fulfilled" ? openAlexResults.value : [];

        const seen = new Set<string>();
        const results: FormattedUniversityResult[] = [];

        for (const u of indoResults) {
            if (!seen.has(u.value)) {
                seen.add(u.value);
                results.push(u);
            }
        }

        for (const u of globalResults) {
            if (!seen.has(u.value)) {
                seen.add(u.value);
                results.push(u);
            }
        }

        return NextResponse.json({ results: results.slice(0, 15) });
    } catch {
        return NextResponse.json(
            { results: [], error: "Search unavailable" },
            { status: 503 },
        );
    }
}
