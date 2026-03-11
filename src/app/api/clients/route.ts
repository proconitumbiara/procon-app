import { count } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import { clientsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

/**
 * GET /api/clients
 * Query params: limit (opcional), offset (opcional).
 * Retorna clientes e setores; se limit/offset forem passados, aplica paginação nos clientes e totalCount.
 */
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get("limit");
  const offsetParam = searchParams.get("offset");
  const limit = limitParam ? Math.min(Number.parseInt(limitParam, 10) || 0, 500) : undefined;
  const offset = offsetParam ? Number.parseInt(offsetParam, 10) || 0 : undefined;
  const usePagination = limit && limit > 0;

  const [clientsResult, sectors] = await Promise.all([
    usePagination
      ? db.query.clientsTable.findMany({
          limit,
          offset: offset && offset >= 0 ? offset : 0,
        })
      : db.query.clientsTable.findMany(),
    db.query.sectorsTable.findMany(),
  ]);

  const clients = clientsResult;
  const response: { clients: typeof clients; sectors: typeof sectors; totalCount?: number } = {
    clients,
    sectors,
  };
  if (usePagination) {
    const [row] = await db.select({ count: count() }).from(clientsTable);
    response.totalCount = Number(row?.count ?? 0);
  }
  return NextResponse.json(response);
} 