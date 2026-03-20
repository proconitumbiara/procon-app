import { count } from "drizzle-orm";
import { desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/db";
import { complaintsTable } from "@/db/schema";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

const authWithSecret = (request: NextRequest) => {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${env.COMPLAINTS_SECRET}`) {
    return false;
  }
  return true;
};

function toErrorDetails(error: unknown) {
  const anyError = error as any;
  return {
    name: anyError?.name,
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    cause: anyError?.cause,
    // Campos comuns em erros do Postgres (via `pg` / node-postgres)
    code: anyError?.code,
    detail: anyError?.detail,
    constraint: anyError?.constraint,
    hint: anyError?.hint,
    position: anyError?.position,
    schema: anyError?.schema,
    table: anyError?.table,
    column: anyError?.column,
    dataType: anyError?.dataType,
    severity: anyError?.severity,
    internalQuery: anyError?.internalQuery,
    internalPosition: anyError?.internalPosition,
    where: anyError?.where,
    routine: anyError?.routine,
  };
}

const evidenceTypeSchema = z.enum(["documentary", "photo_video", "none"]);

const createComplaintSchema = z.object({
  isAnonymous: z.boolean().optional().default(false),

  // Consumidor (opcional)
  complainantName: z.string().optional().nullable(),
  complainantProfession: z.string().optional().nullable(),
  complainantCpf: z.string().optional().nullable(),
  complainantPhone: z.string().optional().nullable(),
  complainantEmail: z.string().optional().nullable(),
  complainantAddress: z.string().optional().nullable(),
  complainantZipCode: z.string().optional().nullable(),

  // Fornecedor (obrigatório no schema)
  respondentCompanyName: z.string().min(1),
  respondentCnpj: z.string().optional().nullable(),
  respondentAddress: z.string().min(1),
  respondentZipCode: z.string().min(1),
  respondentAdditionalInfo: z.string().optional().nullable(),

  // Relato (obrigatório no schema)
  factsDescription: z.string().min(1),
  // O schema original do banco chama a coluna de `request`.
  // Para evitar conflito mental no código, aceitamos como `requestText` e/ou `request`.
  requestText: z.string().min(1).optional().nullable(),
  request: z.string().min(1).optional().nullable(),

  // Meios de Prova
  evidenceType: evidenceTypeSchema.optional().default("none"),

  // Data (coluna `date` -> string YYYY-MM-DD)
  viewingStatus: z.enum(["pending", "viewed"]).optional().default("pending"),
  viewingDate: z.string().optional().nullable(),
  filingDate: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "filingDate deve estar no formato YYYY-MM-DD",
    ),
});

function normalizeComplaintInput(
  parsed: z.infer<typeof createComplaintSchema>,
) {
  const requestValue = (parsed.requestText ?? parsed.request ?? "").trim();
  if (!requestValue) {
    // Garante que a coluna `request` (not null) seja preenchida.
    throw new z.ZodError([
      {
        code: z.ZodIssueCode.custom,
        message: "request é obrigatório",
        path: ["request"],
      },
    ]);
  }
  return {
    isAnonymous: parsed.isAnonymous ?? false,

    complainantName: parsed.complainantName ?? null,
    complainantProfession: parsed.complainantProfession ?? null,
    complainantCpf: parsed.complainantCpf ?? null,
    complainantPhone: parsed.complainantPhone ?? null,
    complainantEmail: parsed.complainantEmail ?? null,
    complainantAddress: parsed.complainantAddress ?? null,
    complainantZipCode: parsed.complainantZipCode ?? null,

    respondentCompanyName: parsed.respondentCompanyName,
    respondentCnpj: parsed.respondentCnpj ?? null,
    respondentAddress: parsed.respondentAddress,
    respondentZipCode: parsed.respondentZipCode,
    respondentAdditionalInfo: parsed.respondentAdditionalInfo ?? null,

    factsDescription: parsed.factsDescription,
    request: requestValue,

    evidenceType: parsed.evidenceType ?? "none",
    filingDate: parsed.filingDate,
    viewingStatus: parsed.viewingStatus ?? "pending",
    viewingDate: parsed.viewingDate ?? null,
  };
}

export async function GET(request: NextRequest) {
  if (!authWithSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);

    const limitParam = searchParams.get("limit");
    const offsetParam = searchParams.get("offset");

    const limit = limitParam
      ? Math.min(Number.parseInt(limitParam, 10) || 0, 500)
      : undefined;
    const offset = offsetParam
      ? Number.parseInt(offsetParam, 10) || 0
      : undefined;
    const shouldComputeTotal =
      (limit !== undefined && limit > 0) ||
      (offset !== undefined && offset >= 0);

    const [complaints, totalResult] = await Promise.all([
      db.query.complaintsTable.findMany({
        limit: limit && limit > 0 ? limit : undefined,
        offset: offset !== undefined && offset >= 0 ? offset : undefined,
        orderBy: (t, { desc }) => [desc(t.createdAt)],
      }),
      shouldComputeTotal
        ? db.select({ count: count() }).from(complaintsTable)
        : Promise.resolve([{ count: 0 }]),
    ]);

    return NextResponse.json({
      complaints,
      totalCount: shouldComputeTotal
        ? Number(totalResult[0]?.count ?? 0)
        : undefined,
    });
  } catch (error) {
    logger.error("GET /api/complaint failed", { error });
    if (process.env.NODE_ENV !== "production") {
      const details = toErrorDetails(error);
      return NextResponse.json(
        { error: "Internal Server Error", details },
        { status: 500 },
      );
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  if (!authWithSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createComplaintSchema.parse(body);
    const normalized = normalizeComplaintInput(parsed);

    const [created] = await db
      .insert(complaintsTable)
      .values({
        isAnonymous: normalized.isAnonymous,
        complainantName: normalized.complainantName,
        complainantProfession: normalized.complainantProfession,
        complainantCpf: normalized.complainantCpf,
        complainantPhone: normalized.complainantPhone,
        complainantEmail: normalized.complainantEmail,
        complainantAddress: normalized.complainantAddress,
        complainantZipCode: normalized.complainantZipCode,
        respondentCompanyName: normalized.respondentCompanyName,
        respondentCnpj: normalized.respondentCnpj,
        respondentAddress: normalized.respondentAddress,
        respondentZipCode: normalized.respondentZipCode,
        respondentAdditionalInfo: normalized.respondentAdditionalInfo,
        factsDescription: normalized.factsDescription,
        request: normalized.request,
        evidenceType: normalized.evidenceType,
        filingDate: normalized.filingDate,
      })
      .returning();

    return NextResponse.json(
      {
        id: created.id,
        complaint: created,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Bad Request", issues: error.issues },
        { status: 400 },
      );
    }

    logger.error("POST /api/complaint failed", { error });
    if (process.env.NODE_ENV !== "production") {
      const details = toErrorDetails(error);

      return NextResponse.json(
        { error: "Internal Server Error", details },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
