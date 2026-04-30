import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "private", "panduan-penggunaan-qris.pdf");

    // 🔥 DEBUG
    console.log("PATH:", filePath);

    if (!fs.existsSync(filePath)) {
      console.log("FILE NOT FOUND");
      return new NextResponse("File not found", { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="panduan-penggunaan-qris.pdf"',
      },
    });
  } catch (error) {
    console.error("ERROR:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}