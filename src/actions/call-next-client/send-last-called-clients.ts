"use server";

import { desc, eq } from "drizzle-orm";

import { db } from "@/db";

export async function sendLastCalledClients() {
  // Busca os últimos 20 treatments, ordenados por createdAT desc
  const treatments = await db.query.treatmentsTable.findMany({
    orderBy: (t) => desc(t.createdAT),
    limit: 20,
  });

  // Busca os dados relacionados para cada treatment
  const result = await Promise.all(
    treatments.map(async (treatment) => {
      const ticket = await db.query.ticketsTable.findFirst({
        where: (t) => eq(t.id, treatment.ticketId),
      });
      const client = ticket
        ? await db.query.clientsTable.findFirst({
          where: (c) => eq(c.id, ticket.clientId),
        })
        : null;
      const operation = await db.query.operationsTable.findFirst({
        where: (o) => eq(o.id, treatment.operationId),
      });
      const servicePoint = operation
        ? await db.query.servicePointsTable.findFirst({
          where: (sp) => eq(sp.id, operation.servicePointId),
        })
        : null;
      const sector = servicePoint
        ? await db.query.sectorsTable.findFirst({
          where: (s) => eq(s.id, servicePoint.sectorId),
        })
        : null;

      return {
        nome: client?.name ?? "",
        guiche:
          servicePoint && sector ? `${servicePoint.name} - ${sector.name}` : "",
        chamadoEm: treatment.createdAT,
      };
    }),
  );

  // Ordena o resultado do mais atual para o mais antigo
  result.sort(
    (a, b) => new Date(b.chamadoEm).getTime() - new Date(a.chamadoEm).getTime(),
  );

  // Limita para os 5 mais recentes
  const top5 = result.slice(0, 5);

  // Envia para o servidor HTTP
  await fetch("http://192.168.1.12:3001/call", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(top5),
  });
}
