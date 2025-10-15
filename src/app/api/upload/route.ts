import { mkdir, writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { join } from "path";

import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get("file") as File;
        const type = formData.get("type") as string; // "complaint", "consultation", "denunciation"

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        // Validar tipo de arquivo
        if (file.type !== "application/pdf") {
            return NextResponse.json({ error: "Only PDF files allowed" }, { status: 400 });
        }

        // Criar nome único para o arquivo
        const timestamp = Date.now();
        const fileName = `${timestamp}_${file.name}`;

        // Definir pasta de destino baseada no tipo
        const uploadDir = join(process.cwd(), "uploads", type);
        const filePath = join(uploadDir, fileName);

        // Criar diretório se não existir
        await mkdir(uploadDir, { recursive: true });

        // Converter File para Buffer e salvar
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        // Retornar URL relativa para acesso
        const fileUrl = `/uploads/${type}/${fileName}`;

        return NextResponse.json({
            success: true,
            fileUrl,
            fileName
        });

    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}