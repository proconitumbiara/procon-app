import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import { ticketsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

/**
 * GET /api/tickets
 * Query params: status (opcional), limit (opcional), offset (opcional).
 * Retorna apenas os tickets solicitados (filtro por status e/ou paginação).
 */
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const limitParam = searchParams.get("limit");
  const offsetParam = searchParams.get("offset");
  const limit = limitParam ? Math.min(Number.parseInt(limitParam, 10) || 0, 500) : undefined;
  const offset = offsetParam ? Number.parseInt(offsetParam, 10) || 0 : undefined;

  const conditions = status ? eq(ticketsTable.status, status) : undefined;
  const query = db.query.ticketsTable.findMany({
    where: conditions,
    limit: limit && limit > 0 ? limit : undefined,
    offset: offset && offset >= 0 ? offset : undefined,
  });

  const tickets = await query;

  return NextResponse.json({ tickets });
}
