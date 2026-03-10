"use server";

import { and, asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import {
  clientsTable,
  operationsTable,
  sectorsTable,
  servicePointsTable,
  ticketsTable,
  treatmentsTable,
} from "@/db/schema";
import { authActionClient } from "@/lib/next-safe-action";
import { sendToPanel } from "@/lib/panel-api";
import { getPriorityLabel } from "@/lib/priority-utils";

import { ErrorMessages, ErrorTypes } from "./schema";
import { sendLastCalledClients } from "./send-last-called-clients";

export const callNextTicket = authActionClient.action(async ({ ctx }) => {
  const { session } = ctx;

  const operation = await db.query.operationsTable.findFirst({
    where: and(
      eq(operationsTable.userId, session.user.id),
      eq(operationsTable.status, "operating"),
    ),
  });
  if (!operation) {
    return {
      error: {
        type: ErrorTypes.NO_ACTIVE_OPERATION,
        message: ErrorMessages[ErrorTypes.NO_ACTIVE_OPERATION],
      },
    };
  }

  const existingTreatment = await db.query.treatmentsTable.findFirst({
    where: and(
      eq(treatmentsTable.operationId, operation.id),
      eq(treatmentsTable.status, "in_service"),
    ),
  });

  if (existingTreatment) {
    return {
      error: {
        type: ErrorTypes.TREATMENT_IN_PROGRESS,
        message: ErrorMessages[ErrorTypes.TREATMENT_IN_PROGRESS],
      },
    };
  }

  const servicePoint = await db.query.servicePointsTable.findFirst({
    where: eq(servicePointsTable.id, operation.servicePointId),
  });
  if (!servicePoint) {
    return {
      error: {
        type: ErrorTypes.SERVICE_POINT_NOT_FOUND,
        message: ErrorMessages[ErrorTypes.SERVICE_POINT_NOT_FOUND],
      },
    };
  }

  const sectorId = servicePoint.sectorId;
  const sector = await db.query.sectorsTable.findFirst({
    where: eq(sectorsTable.id, sectorId),
  });
  if (!sector) {
    return {
      error: {
        type: ErrorTypes.SECTOR_NOT_FOUND,
        message: ErrorMessages[ErrorTypes.SECTOR_NOT_FOUND],
      },
    };
  }

  const preferredPriority = servicePoint.preferredPriority ?? 0;
  const fallbackPriority = preferredPriority === 1 ? 0 : 1;

  let ticket = await db.query.ticketsTable.findFirst({
    where: and(
      eq(ticketsTable.status, "pending"),
      eq(ticketsTable.sectorId, sectorId),
      eq(ticketsTable.priority, preferredPriority),
    ),
    orderBy: (t) => asc(t.createdAt),
  });

  if (!ticket) {
    ticket = await db.query.ticketsTable.findFirst({
      where: and(
        eq(ticketsTable.status, "pending"),
        eq(ticketsTable.sectorId, sectorId),
        eq(ticketsTable.priority, fallbackPriority),
      ),
      orderBy: (t) => asc(t.createdAt),
    });
  }

  if (!ticket) {
    return {
      error: {
        type: ErrorTypes.NO_PENDING_TICKET,
        message: ErrorMessages[ErrorTypes.NO_PENDING_TICKET],
      },
    };
  }

  await db.insert(treatmentsTable).values({
    ticketId: ticket.id,
    operationId: operation.id,
  });

  await db
    .update(ticketsTable)
    .set({ status: "in-attendance" })
    .where(eq(ticketsTable.id, ticket.id));

  await sendLastCalledClients();

  const client = await db.query.clientsTable.findFirst({
    where: eq(clientsTable.id, ticket.clientId),
  });
  if (!client) {
    return {
      error: {
        type: ErrorTypes.CLIENT_NOT_FOUND,
        message: ErrorMessages[ErrorTypes.CLIENT_NOT_FOUND],
      },
    };
  }

  await sendToPanel({
    nome: client.name,
    guiche: `${servicePoint.name} - ${sector.name}`,
    prioridade: getPriorityLabel(ticket.priority),
    chamadoEm: new Date().toISOString(),
  });

  revalidatePath("/atendimento");
  revalidatePath("/atendimentos-pendentes");

  return { success: true };
});
