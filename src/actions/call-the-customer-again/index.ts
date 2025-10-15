"use server";

import { and, eq } from "drizzle-orm";
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

export const callTheCustomerAgain = actionClient.action(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { error: "Usuário não autenticado" };
  }

  // Buscar operação ativa do usuário logado
  const operation = await db.query.operationsTable.findFirst({
    where: and(
      eq(operationsTable.userId, session.user.id),
      eq(operationsTable.status, "operating"),
    ),
  });

  if (!operation) {
    return { error: "Nenhuma operação ativa encontrada" };
  }

  // Buscar o treatment em andamento para esta operação
  const treatment = await db.query.treatmentsTable.findFirst({
    where: and(
      eq(treatmentsTable.operationId, operation.id),
      eq(treatmentsTable.status, "in_service"),
    ),
  });

  if (!treatment) {
    return { error: "Nenhum atendimento em andamento encontrado" };
  }

  // Buscar o ticket associado ao treatment
  const ticket = await db.query.ticketsTable.findFirst({
    where: eq(ticketsTable.id, treatment.ticketId),
  });

  if (!ticket) {
    return { error: "Ticket não encontrado" };
  }

  // Buscar o cliente do ticket
  const client = await db.query.clientsTable.findFirst({
    where: eq(clientsTable.id, ticket.clientId),
  });

  if (!client) {
    return { error: "Cliente não encontrado" };
  }

  // Buscar o ponto de serviço da operação
  const servicePoint = await db.query.servicePointsTable.findFirst({
    where: eq(servicePointsTable.id, operation.servicePointId),
  });

  if (!servicePoint) {
    return { error: "Ponto de serviço não encontrado" };
  }

  // Buscar o setor do ponto de serviço
  const sector = await db.query.sectorsTable.findFirst({
    where: eq(sectorsTable.id, servicePoint.sectorId),
  });

  if (!sector) {
    return { error: "Setor não encontrado" };
  }

  // Enviar para o painel Tizen via HTTP POST
  await fetch("http://192.168.1.13:3001/call", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome: client.name,
      guiche: `${servicePoint.name} - ${sector.name}`,
    }),
  });

  return { success: true };
});
