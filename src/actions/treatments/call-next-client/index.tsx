"use server";

import { and, asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import {
  operationsTable,
  ticketsTable,
  treatmentsTable,
} from "@/db/schema";
import { permissionedActionClient } from "@/lib/next-safe-action";
import { sendToPanel } from "@/lib/panel-api";
import { getPriorityLabel } from "@/lib/priority-utils";
import { logger } from "@/lib/logger";
import { pusherServer } from "@/lib/pusher-server";
import { REALTIME_CHANNELS, REALTIME_EVENTS } from "@/lib/realtime";

import { ErrorMessages, ErrorTypes } from "./schema";
import { sendLastCalledClients } from "./send-last-called-clients";

export const callNextTicket = permissionedActionClient("treatments.manage").action(
  async ({ ctx }) => {
    const { session, perms } = ctx;

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

  if (!perms.canAccessSectorKey(sector.key_name)) {
    return {
      error: {
        type: ErrorTypes.UNAUTHENTICATED,
        message: "Acesso negado para este setor",
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

  await db.transaction(async (tx) => {
    await tx.insert(treatmentsTable).values({
      ticketId: ticketWithClient.id,
      operationId: operation.id,
      startedAt: new Date(),
    });

    await tx
      .update(ticketsTable)
      .set({ status: "in-attendance", calledAt: new Date(), updatedAt: new Date() })
      .where(eq(ticketsTable.id, ticketWithClient.id));

    await tx
      .update(operationsTable)
      .set({ status: "in-attendance", updatedAt: new Date() })
      .where(eq(operationsTable.id, operation.id));
  });

  revalidatePath("/atendimento");
  revalidatePath("/fila-atendimentos");

  // Pusher em background (não bloquear resposta ao usuário)
  void sendLastCalledClients().catch((err) => {
    logger.error("callNextTicket sendLastCalledClients failed", {
      action: "call-next-ticket",
      error: err,
    });
  });
  void sendToPanel({
    nome: client.name,
    guiche: `${servicePoint.name} - ${sector.name}`,
    prioridade: getPriorityLabel(ticketWithClient.priority),
    chamadoEm: new Date().toISOString(),
  }).catch((err) => {
    logger.error("callNextTicket sendToPanel failed", {
      action: "call-next-ticket",
      error: err,
    });
  });
  void pusherServer
    .trigger(REALTIME_CHANNELS.tickets, REALTIME_EVENTS.ticketsChanged, {
      ticketId: ticketWithClient.id,
      status: "in-attendance",
    })
    .catch((err) => {
      logger.warn("callNextTicket ticketsChanged emit failed", {
        action: "call-next-ticket",
        error: err,
      });
    });
  void pusherServer
    .trigger(REALTIME_CHANNELS.operations, REALTIME_EVENTS.autoCallCheck, {
      operationId: operation.id,
    })
    .catch(() => {});

  return { success: true };
});
