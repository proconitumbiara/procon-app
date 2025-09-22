"use server";

import { and, asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import {
  clientsTable,
  operationsTable,
  sectorsTable,
  servicePointsTable,
  ticketsTable,
  treatmentsTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

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

  // Buscar ticket pendente mais antigo do mesmo setor
  const ticket = await db.query.ticketsTable.findFirst({
    where: and(
      eq(ticketsTable.status, "pending"),
      eq(ticketsTable.sectorId, sectorId),
    ),
    orderBy: (ticketsTable) => asc(ticketsTable.createdAT),
  });
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

  // Chama a função para enviar a lista atualizada
  await sendLastCalledClients();

  // Atualizar status do ticket para 'finished'
  await db
    .update(ticketsTable)
    .set({ status: "in-attendance" })
    .where(eq(ticketsTable.id, ticket.id));

  revalidatePath("/professional/professionals-services");

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

  // Enviar para o painel Tizen via HTTP POST
  await fetch("http://192.168.1.13:3001/call", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome: client.name,
      guiche: servicePointName + " - " + sectorName,
    }),
  });

  return { success: true };
});
