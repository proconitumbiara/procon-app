import { and, asc, eq, exists, inArray, lt, notExists } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import {
  operationsTable,
  sectorsTable,
  servicePointsTable,
  ticketsTable,
  treatmentsTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import { buildUserPermissions } from "@/lib/authorization";

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

  const perms = buildUserPermissions({
    id: session.user.id,
    role: session.user.role,
    profile: (session.user as { profile?: string | null }).profile,
  });

  if (!perms.can("treatments.manage")) {
    return NextResponse.json({ showCountdown: false });
  }

  const tenMinutesAgo = new Date(Date.now() - PENDING_MINUTES * 60 * 1000);

  const baseEligibilityConditions = [
    eq(operationsTable.status, "operating"),
    notExists(
      db
        .select({ operationId: treatmentsTable.operationId })
        .from(treatmentsTable)
        .where(
          and(
            eq(treatmentsTable.operationId, operationsTable.id),
            eq(treatmentsTable.status, "in_service"),
          ),
        ),
    ),
    exists(
      db
        .select({ id: ticketsTable.id })
        .from(ticketsTable)
        .where(
          and(
            eq(ticketsTable.status, "pending"),
            eq(ticketsTable.sectorId, servicePointsTable.sectorId),
            lt(ticketsTable.createdAt, tenMinutesAgo),
          ),
        ),
    ),
  ];

  const whereConditions =
    perms.sectorKeyFilter.length === 1 && perms.sectorKeyFilter[0] === "*"
      ? and(...baseEligibilityConditions)
      : and(
          ...baseEligibilityConditions,
          inArray(sectorsTable.key_name, perms.sectorKeyFilter),
        );

  const oldestEligibleOperation = await db
    .select({
      id: operationsTable.id,
      userId: operationsTable.userId,
    })
    .from(operationsTable)
    .innerJoin(
      servicePointsTable,
      eq(servicePointsTable.id, operationsTable.servicePointId),
    )
    .innerJoin(sectorsTable, eq(sectorsTable.id, servicePointsTable.sectorId))
    .where(whereConditions)
    .orderBy(asc(operationsTable.updatedAt), asc(operationsTable.id))
    .limit(1)
    .then((rows) => rows[0]);

  if (!oldestEligibleOperation) {
    return NextResponse.json({ showCountdown: false });
  }

  const showCountdown = oldestEligibleOperation.userId === session.user.id;

  return NextResponse.json({ showCountdown });
}
