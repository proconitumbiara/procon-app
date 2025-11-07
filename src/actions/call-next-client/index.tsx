"use server";

import { and, asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import {
  clientsTable,
  operationsTable,
  pausesTable,
  sectorsTable,
  servicePointsTable,
  ticketsTable,
  treatmentsTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { getPriorityLabel } from "@/lib/priority-utils";

import { ErrorMessages, ErrorTypes } from "./schema";
import { sendLastCalledClients } from "./send-last-called-clients";

export const callNextTicket = actionClient.action(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return {
      error: {
        type: ErrorTypes.UNAUTHENTICATED,
        message: ErrorMessages[ErrorTypes.UNAUTHENTICATED],
      },
    };
  }

  // Buscar operação ativa do usuário logado
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

  // Verificar se já existe um atendimento em andamento para esta operação
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

  // Buscar o ponto de serviço da operação para obter o setor
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
  // Buscar o setor do ponto de serviço
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

  // Determinar qual prioridade buscar baseado na preferência do guichê
  // Se preferredPriority === 1: buscar primeiro tickets prioritários (1), depois comuns (0)
  // Se preferredPriority === 0: buscar primeiro tickets comuns (0), depois prioritários (1)
  const preferredPriority = servicePoint.preferredPriority ?? 0;
  const fallbackPriority = preferredPriority === 1 ? 0 : 1;

  // Buscar ticket pendente com a prioridade preferida
  let ticket = await db.query.ticketsTable.findFirst({
    where: and(
      eq(ticketsTable.status, "pending"),
      eq(ticketsTable.sectorId, sectorId),
      eq(ticketsTable.priority, preferredPriority),
    ),
    orderBy: (ticketsTable) => asc(ticketsTable.createdAT),
  });

  // Fallback: se não houver do tipo preferido, buscar o outro tipo
  if (!ticket) {
    ticket = await db.query.ticketsTable.findFirst({
      where: and(
        eq(ticketsTable.status, "pending"),
        eq(ticketsTable.sectorId, sectorId),
        eq(ticketsTable.priority, fallbackPriority),
      ),
      orderBy: (ticketsTable) => asc(ticketsTable.createdAT),
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

  // Inserir atendimento
  await db.insert(treatmentsTable).values({
    ticketId: ticket.id,
    operationId: operation.id,
  });

  // Chama a função para enviar a lista atualizada
  await sendLastCalledClients();

  // Atualizar status do ticket para 'in-attendance'
  await db
    .update(ticketsTable)
    .set({ status: "in-attendance" })
    .where(eq(ticketsTable.id, ticket.id));

  revalidatePath("/professional/professionals-services");

  // Buscar pausas da operação
  const pauses = await db.query.pausesTable.findMany({
    where: and(
      eq(pausesTable.operationId, operation.id),
      eq(pausesTable.status, "in-progress"),
    ),
  });

  // Atualizar pausas in-progress para finished e calcular duração
  for (const pause of pauses) {
    const start =
      pause.createdAT instanceof Date
        ? pause.createdAT
        : new Date(pause.createdAT);
    const end = new Date();
    const durationMs = end.getTime() - start.getTime();
    const durationMinutes = Math.floor(durationMs / 60000); // duração em minutos

    await db
      .update(pausesTable)
      .set({
        status: "finished",
        duration: durationMinutes,
      })
      .where(eq(pausesTable.id, pause.id));
  }

  // Buscar o cliente do ticket
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

  // Buscar o nome do guichê (ponto de serviço)
  const servicePointName = servicePoint.name;
  const sectorName = sector.name;

  const panelServerUrl = process.env.PANEL_SERVER_URL;
  if (!panelServerUrl) {
    console.warn("PANEL_SERVER_URL não está definido no .env");
    return { success: false };
  }

  await fetch(`${panelServerUrl}/call`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome: client.name,
      guiche: servicePointName + " - " + sectorName,
      prioridade: getPriorityLabel(ticket.priority),
    }),
  });

  return { success: true };
});

revalidatePath("/atendimento");
revalidatePath("/atendimentos-pendentes");
