import { list } from "@vercel/blob";

import { env } from "@/lib/env";

export type ComplaintEvidenceKind = "pdf" | "image" | "video" | "audio";

export type ComplaintEvidenceFile = {
  kind: ComplaintEvidenceKind;
  index?: number;
  fileName: string;
  fileUrl: string;
  blobPath?: string;
};

/**
 * Regra da doc:
 * - Remove tudo que não for dígito do `complaintId`
 * - Exige no mínimo 6 dígitos
 * - Usa os 6 primeiros
 */
export function getIdPrefixFromComplaintId(complaintId: string): string | null {
  const digits = complaintId.replace(/\D/g, "");
  if (digits.length < 6) return null;
  return digits.slice(0, 6);
}

function classifyEvidenceKind(fileName: string): ComplaintEvidenceKind | null {
  const lower = fileName.toLowerCase();

  if (lower.endsWith(".pdf")) return "pdf";

  if (
    lower.endsWith(".jpg") ||
    lower.endsWith(".jpeg") ||
    lower.endsWith(".png") ||
    lower.endsWith(".webp") ||
    lower.endsWith(".gif")
  ) {
    return "image";
  }

  if (lower.endsWith(".mp4")) return "video";
  if (lower.endsWith(".mp3")) return "audio";

  return null;
}

function extractIndexFromDeterministicName(
  fileName: string,
): number | undefined {
  // doc01-123456.pdf / img01-123456.jpg / vid01-123456.mp4
  const match = fileName.match(/^(doc|img|vid)(\d{2})-/);
  if (!match) return undefined;

  const n = Number.parseInt(match[2], 10);
  return Number.isFinite(n) ? n : undefined;
}

function sortByIndexThenName(
  a: ComplaintEvidenceFile,
  b: ComplaintEvidenceFile,
) {
  const ai = a.index ?? Number.MAX_SAFE_INTEGER;
  const bi = b.index ?? Number.MAX_SAFE_INTEGER;
  if (ai !== bi) return ai - bi;
  return a.fileName.localeCompare(b.fileName);
}

function getFileNameFromBlobPath(blobPath?: string) {
  if (!blobPath) return null;
  const parts = blobPath.split("/");
  return parts[parts.length - 1] ?? null;
}

function getPublicUrlFromBlob(blob: any): string | null {
  return blob?.url ?? blob?.downloadUrl ?? null;
}

export async function listComplaintEvidenceFiles({
  idPrefix,
}: {
  idPrefix: string;
}): Promise<{
  documents: ComplaintEvidenceFile[];
  media: ComplaintEvidenceFile[];
}> {
  const documentsPrefix = `denunciations/documents/${idPrefix}/`;
  const mediaPrefix = `denunciations/media/${idPrefix}/`;

  const [documentsResult, mediaResult] = await Promise.all([
    list({
      prefix: documentsPrefix,
      limit: 1000,
      mode: "expanded",
      token: env.BLOB_READ_WRITE_TOKEN,
    }),
    list({
      prefix: mediaPrefix,
      limit: 1000,
      mode: "expanded",
      token: env.BLOB_READ_WRITE_TOKEN,
    }),
  ]);

  const normalize = (blob: any): ComplaintEvidenceFile | null => {
    const blobPath: string | undefined = blob?.pathname;
    const fileName =
      getFileNameFromBlobPath(blobPath) ?? blob?.fileName ?? blob?.name;
    if (!fileName) return null;

    const fileUrl = getPublicUrlFromBlob(blob);
    if (!fileUrl) return null;

    const kind = classifyEvidenceKind(fileName);
    if (!kind) return null;

    return {
      kind,
      index:
        // Mantém a ordenação determinística quando o nome segue o padrão da doc.
        extractIndexFromDeterministicName(fileName),
      fileName,
      fileUrl,
      blobPath,
    };
  };

  const documents = (documentsResult?.blobs ?? [])
    .map(normalize)
    .filter(Boolean)
    .filter((f) => f?.kind === "pdf")
    .sort((a, b) => sortByIndexThenName(a!, b!));

  const media = (mediaResult?.blobs ?? [])
    .map(normalize)
    .filter(Boolean)
    .filter((f) => f?.kind !== "pdf")
    .sort((a, b) => sortByIndexThenName(a!, b!));

  return {
    documents: documents.filter(Boolean) as ComplaintEvidenceFile[],
    media: media.filter(Boolean) as ComplaintEvidenceFile[],
  };
}

export async function listComplaintDocumentsByIdPrefix({
  idPrefix,
}: {
  idPrefix: string;
}): Promise<ComplaintEvidenceFile[]> {
  const { documents } = await listComplaintEvidenceFiles({ idPrefix });
  return documents;
}

export async function listComplaintMediaByIdPrefix({
  idPrefix,
}: {
  idPrefix: string;
}): Promise<ComplaintEvidenceFile[]> {
  const { media } = await listComplaintEvidenceFiles({ idPrefix });
  return media;
}
