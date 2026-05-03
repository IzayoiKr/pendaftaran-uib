export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  if (!q) return Response.json([]);

  try {
    const res = await fetch(
      `http://universities.hipolabs.com/search?name=${q}`
    );

    const data = await res.json();

    const result = data.map((u: any) => u.name);

    return Response.json(result);
  } catch (err) {
    console.error("University API error:", err);
    return Response.json([]);
  }
}