import { constants } from "fs";
import { access, readFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { extname, join } from "path";

import { auth } from "@/lib/auth";

const CONTENT_TYPE_BY_EXTENSION: Record<string, string> = {
  ".pdf": "application/pdf",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

// Pastas que requerem autenticação (PDFs e documentos sensíveis)
const PROTECTED_FOLDERS = new Set([
  "complaints",
  "consultations",
  "denunciations",
  "temp",
]);

// Pastas públicas (apenas imagens)
const PUBLIC_IMAGE_FOLDERS = new Set(["news", "projects", "services"]);

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  try {
    const { path } = await context.params;

    // Verifica se a pasta requer autenticação (para caminhos locais antigos)
    const folder = path[0];
    const requiresAuth = PROTECTED_FOLDERS.has(folder);
    const isPublicImage = PUBLIC_IMAGE_FOLDERS.has(folder);

    if (requiresAuth) {
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // Para pastas públicas, apenas permitir imagens
    if (isPublicImage && path.length > 1) {
      const fileName = path[path.length - 1];
      const extension = extname(fileName).toLowerCase();
      if (!IMAGE_EXTENSIONS.includes(extension)) {
        return NextResponse.json(
          { error: "Apenas imagens são permitidas" },
          { status: 403 },
        );
      }
    }

    // Tentar servir do sistema de arquivos local (compatibilidade com arquivos antigos)
    const filePath = join(process.cwd(), "uploads", ...path);
    const extension = extname(filePath).toLowerCase();
    const contentType =
      CONTENT_TYPE_BY_EXTENSION[extension] ?? "application/octet-stream";

    // Verifica se o arquivo existe localmente
    let fileBuffer: Buffer;
    try {
      await access(filePath, constants.F_OK);
      fileBuffer = await readFile(filePath);
    } catch {
      // Se for uma imagem e não existir, usa uma imagem padrão como fallback
      if (IMAGE_EXTENSIONS.includes(extension)) {
        const fallbackImagePath = join(process.cwd(), "public", "Logo.png");
        try {
          fileBuffer = await readFile(fallbackImagePath);
        } catch (fallbackError) {
          console.error("Fallback image not found:", fallbackError);
          return NextResponse.json(
            { error: "File not found" },
            { status: 404 },
          );
        }
      } else {
        // Para outros tipos de arquivo, retorna 404
        return NextResponse.json({ error: "File not found" }, { status: 404 });
      }
    }

    const headers: Record<string, string> = {
      "Content-Type": contentType,
    };

    if (contentType === "application/pdf") {
      headers["Content-Disposition"] = "inline";
    }

    return new NextResponse(new Uint8Array(fileBuffer), {
      headers,
    });
  } catch (error) {
    console.error("File serve error:", error);
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
