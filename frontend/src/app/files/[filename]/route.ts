import { type NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const ALLOWED_FILES: Record<string, string> = {
    contoh_pasphoto: "contoh_pasphoto.pdf",
    panduanpenggunaanqris: "panduan_penggunaan_qris.pdf",
    pengunduran: "pengunduran.pdf",
    VA: "VA.pdf",
};

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ filename: string }> },
) {
    const { filename } = await params;
    const resolvedFilename = ALLOWED_FILES[filename];

    if (!resolvedFilename) {
        return new NextResponse("File not found", { status: 404 });
    }

    let filePath = path.resolve(
        process.cwd(),
        "src",
        "assets",
        "private",
        resolvedFilename,
    );

    try {
        await fs.access(filePath);
    } catch {
        filePath = path.resolve(
            process.cwd(),
            "assets",
            "private",
            resolvedFilename,
        );
    }

    try {
        const fileBuffer = await fs.readFile(filePath);

        const stream = new ReadableStream({
            start(controller) {
                controller.enqueue(new Uint8Array(fileBuffer));
                controller.close();
            },
        });

        return new NextResponse(stream, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `inline; filename="${resolvedFilename}"`,
                "Cache-Control": "private, no-store, must-revalidate",
            },
        });
    } catch (err) {
        const isNotFound =
            err instanceof Error &&
            "code" in err &&
            (err as NodeJS.ErrnoException).code === "ENOENT";

        return new NextResponse(
            isNotFound ? "File not found" : "Internal Server Error",
            { status: isNotFound ? 404 : 500 },
        );
    }
}
