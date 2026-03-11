import { and, asc, eq, lt } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import {
  operationsTable,
  ticketsTable,
  treatmentsTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";

const PENDING_MINUTES = 10;

/**
 * GET /api/auto-call/check
 * Retorna { showCountdown: true } apenas para o usuário cuja operação está
 * "operating" sem atendimento e tem o updatedAt mais antigo, quando existem
 * tickets pendentes há mais de 10 minutos.
 */
export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenMinutesAgo = new Date(Date.now() - PENDING_MINUTES * 60 * 1000);

  const [eligibleTicket] = await db
    .select({ id: ticketsTable.id })
    .from(ticketsTable)
    .where(
      and(
        eq(ticketsTable.status, "pending"),
        lt(ticketsTable.createdAt, tenMinutesAgo)
      )
    )
    .limit(1);

  if (!eligibleTicket) {
    return NextResponse.json({ showCountdown: false });
  }

  const operationIdsWithService = await db
    .select({ operationId: treatmentsTable.operationId })
    .from(treatmentsTable)
    .where(eq(treatmentsTable.status, "in_service"));

  const idsWithService = new Set(
    operationIdsWithService
      .map((r) => r.operationId)
      .filter((id): id is string => id != null)
  );

  const operatingOperations = await db.query.operationsTable.findMany({
    where: eq(operationsTable.status, "operating"),
    orderBy: asc(operationsTable.updatedAt),
    columns: { id: true, userId: true },
  });

  const oldestIdleOperation = operatingOperations.find(
    (op) => !idsWithService.has(op.id)
  );

  if (!oldestIdleOperation) {
    return NextResponse.json({ showCountdown: false });
  }

  const showCountdown = oldestIdleOperation.userId === session.user.id;

  return NextResponse.json({ showCountdown });
}
