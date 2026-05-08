import { NextResponse, type NextRequest } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

const ALLOWED_FILES: Record<string, string> = {
    contoh_pasphoto: 'contoh_pasphoto.pdf',
    panduanpenggunaanqris: 'panduan_penggunaan_qris.pdf',
    pengunduran: 'pengunduran.pdf',
    VA: 'VA.pdf',
}

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ filename: string }> }
) {
    const { filename } = await params;
    const resolvedFilename = ALLOWED_FILES[filename];

    if (!resolvedFilename) {
        return new NextResponse('File not found', { status: 404 });
    }

    const filePath = path.join(process.cwd(), 'private', resolvedFilename);

    try {
        const buffer = await readFile(filePath);
        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${resolvedFilename}"`,
            }
        })
    } catch (err) {
        const isNotFound =
            err instanceof Error &&
            'code' in err &&
            (err as NodeJS.ErrnoException).code == 'ENOENT';
        return new NextResponse(
            isNotFound ? 'File not found' : 'Internal Server Error',
            { status: isNotFound ? 404 : 500 },
        );
    }
}
