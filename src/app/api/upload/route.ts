import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { extname } from "path";

import { auth } from "@/lib/auth";

const PDF_ONLY_FOLDERS = new Set(["complaints", "consultations", "denunciations"]);
const IMAGE_ONLY_FOLDERS = new Set(["news", "projects", "services"]);
const FLEX_FOLDERS = new Set(["temp"]);
const ALLOWED_FOLDERS = new Set([
  ...PDF_ONLY_FOLDERS,
  ...IMAGE_ONLY_FOLDERS,
  ...FLEX_FOLDERS,
]);

const IMAGE_MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "Nenhum arquivo enviado." },
        { status: 400 },
      );
    }

    if (!type || !ALLOWED_FOLDERS.has(type)) {
      return NextResponse.json(
        { error: "Pasta de destino inválida." },
        { status: 400 },
      );
    }

    const isPdf = file.type === "application/pdf";
    const isImage = file.type.startsWith("image/");

    if (PDF_ONLY_FOLDERS.has(type) && !isPdf) {
      return NextResponse.json(
        { error: "Apenas arquivos PDF são permitidos para este tipo." },
        { status: 400 },
      );
    }

    if (IMAGE_ONLY_FOLDERS.has(type) && !isImage) {
      return NextResponse.json(
        { error: "Apenas imagens são permitidas para este tipo." },
        { status: 400 },
      );
    }

    if (!isPdf && !isImage) {
      return NextResponse.json(
        { error: "Tipo de arquivo não suportado." },
        { status: 400 },
      );
    }

    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).slice(2, 8);
    let extension = extname(file.name).toLowerCase();

    if (!extension) {
      extension = isPdf ? ".pdf" : IMAGE_MIME_TO_EXT[file.type] ?? ".bin";
    }

    if (isImage && IMAGE_ONLY_FOLDERS.has(type)) {
      extension = IMAGE_MIME_TO_EXT[file.type] ?? extension;
    }

    const fileName = `${timestamp}_${randomPart}${extension}`;
    const blobPath = `${type}/${fileName}`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const blob = await put(blobPath, buffer, {
      access: "public",
      contentType: file.type,
    });

    return NextResponse.json({
      success: true,
      fileUrl: blob.url,
      fileName,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}