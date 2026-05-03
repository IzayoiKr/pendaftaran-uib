export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  if (!q) return Response.json([]);

  try {
    const res = await fetch(
      `https://api-sekolah-indonesia.vercel.app/sekolah/s?sekolah=${q}`
    );

    const data = await res.json();

    const result =
      data?.dataSekolah?.map((s: any) => s.sekolah) || [];

    return Response.json(result);
  } catch (err) {
    console.error("School API error:", err);
    return Response.json([]);
  }
}