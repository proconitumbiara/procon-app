import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import { ticketsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

/**
 * GET /api/tickets/pending-with-names
 * Retorna tickets com status 'pending' já com clientName e sectorName.
 * Query params: limit (opcional).
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
  const limit = limitParam
    ? Math.min(Number.parseInt(limitParam, 10) || 0, 500)
    : undefined;

  const ticketsWithRelations = await db.query.ticketsTable.findMany({
    where: eq(ticketsTable.status, "pending"),
    orderBy: (t, { asc }) => [asc(t.createdAt)],
    limit: limit && limit > 0 ? limit : undefined,
    with: {
      client: true,
      sector: true,
    },
  });

  const tickets = ticketsWithRelations.map((t) => ({
    id: t.id,
    status: t.status,
    priority: t.priority ?? 0,
    clientId: t.clientId,
    clientName: t.client?.name ?? "-",
    sectorId: t.sectorId,
    sectorName: t.sector?.name ?? "-",
    createdAt: t.createdAt,
  }));

  return NextResponse.json({ tickets });
}
