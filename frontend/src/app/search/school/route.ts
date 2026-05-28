import { NextRequest, NextResponse } from "next/server";

interface DevAPISchoolAddress {
    nama_kabupaten: string;
    nama_provinsi: string;
}

interface DevAPISchoolRaw {
    npsn: string;
    nama: string;
    bentukPendidikan: string;
    alamat: DevAPISchoolAddress;
}

interface FormattedSchoolResult {
    value: string;
    label: string;
    npsn: string;
    level: string;
    location: string;
    source: string;
    country: string;
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();

    if (!q || q.length < 2) {
        return NextResponse.json({ results: [] });
    }

    try {
        const res = await fetch(
            `https://sekolah.devapi.id/sekolah?nama=${encodeURIComponent(q)}&bentuk_pendidikan=SMA&limit=15`,
            { next: { revalidate: 86400 } },
        );

        if (!res.ok) throw new Error("School API failed");

        const body: { data: DevAPISchoolRaw[] } = await res.json();

        const results: FormattedSchoolResult[] = (body.data || []).map(
            (school) => ({
                value: school.nama,
                label: `${school.nama} (${school.bentukPendidikan}, ${school.alamat.nama_kabupaten})`,
                npsn: school.npsn,
                level: school.bentukPendidikan,
                location: `${school.alamat.nama_provinsi?.trim()}, ${school.alamat.nama_kabupaten?.trim()}`,
                source: "indonesia",
                country: "ID",
            }),
        );

        return NextResponse.json({ results });
    } catch {
        return NextResponse.json(
            { results: [], error: "Search unavailable" },
            { status: 503 },
        );
    }
}
