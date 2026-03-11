"use server";

import { and, asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import {
  operationsTable,
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

  // 1) Operação ativa com servicePoint e sector (uma query)
  const operation = await db.query.operationsTable.findFirst({
    where: and(
      eq(operationsTable.userId, session.user.id),
      eq(operationsTable.status, "operating"),
    ),
    with: {
      servicePoint: {
        with: {
          sector: true,
        },
      },
    },
  });
  if (!operation?.servicePoint?.sector) {
    if (!operation) {
      return {
        error: {
          type: ErrorTypes.NO_ACTIVE_OPERATION,
          message: ErrorMessages[ErrorTypes.NO_ACTIVE_OPERATION],
        },
      };
    }
    return {
      error: {
        type: ErrorTypes.SERVICE_POINT_NOT_FOUND,
        message: ErrorMessages[ErrorTypes.SERVICE_POINT_NOT_FOUND],
      },
    };
  }

  const servicePoint = operation.servicePoint;
  const sector = operation.servicePoint.sector;
  const sectorId = sector.id;

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

  const preferredPriority = servicePoint.preferredPriority ?? 0;
  const fallbackPriority = preferredPriority === 1 ? 0 : 1;

  // 2) Próximo ticket com client (uma query; fallback de priority em segunda query se necessário)
  let ticketWithClient = await db.query.ticketsTable.findFirst({
    where: and(
      eq(ticketsTable.status, "pending"),
      eq(ticketsTable.sectorId, sectorId),
      eq(ticketsTable.priority, preferredPriority),
    ),
    orderBy: (t) => asc(t.createdAt),
    with: { client: true },
  });

  if (!ticketWithClient) {
    ticketWithClient = await db.query.ticketsTable.findFirst({
      where: and(
        eq(ticketsTable.status, "pending"),
        eq(ticketsTable.sectorId, sectorId),
        eq(ticketsTable.priority, fallbackPriority),
      ),
      orderBy: (t) => asc(t.createdAt),
      with: { client: true },
    });
  }

  if (!ticketWithClient) {
    return {
      error: {
        type: ErrorTypes.NO_PENDING_TICKET,
        message: ErrorMessages[ErrorTypes.NO_PENDING_TICKET],
      },
    };
  }

  const client = ticketWithClient.client;
  if (!client) {
    return {
      error: {
        type: ErrorTypes.CLIENT_NOT_FOUND,
        message: ErrorMessages[ErrorTypes.CLIENT_NOT_FOUND],
      },
    };
  }

  await db.insert(treatmentsTable).values({
    ticketId: ticketWithClient.id,
    operationId: operation.id,
  });

  await db
    .update(ticketsTable)
    .set({ status: "in-attendance" })
    .where(eq(ticketsTable.id, ticketWithClient.id));

  revalidatePath("/atendimento");
  revalidatePath("/atendimentos-pendentes");

  // Pusher em background (não bloquear resposta ao usuário)
  void sendLastCalledClients().catch((err) => {
    console.error("[callNextTicket] sendLastCalledClients:", err);
  });
  void sendToPanel({
    nome: client.name,
    guiche: `${servicePoint.name} - ${sector.name}`,
    prioridade: getPriorityLabel(ticketWithClient.priority),
    chamadoEm: new Date().toISOString(),
  }).catch((err) => {
    console.error("[callNextTicket] sendToPanel:", err);
  });

  return { success: true };
});
