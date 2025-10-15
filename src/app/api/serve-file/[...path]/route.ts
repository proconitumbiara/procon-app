import { readFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { join } from "path";

import { auth } from "@/lib/auth";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { path } = await params;
        const filePath = join(process.cwd(), "uploads", ...path);

        // Ler arquivo como buffer binário para PDFs
        const fileBuffer = await readFile(filePath);

        return new NextResponse(new Uint8Array(fileBuffer), {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": "inline",
            },
        });

    } catch (error) {
        console.error("File serve error:", error);
        return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
}