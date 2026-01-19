"use server";

import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { getPriorityLabel } from "@/lib/priority-utils";

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

      // Garantir que chamadoEm seja uma string ISO
      const chamadoEmDate =
        treatment.createdAT instanceof Date
          ? treatment.createdAT
          : new Date(treatment.createdAT);

      return {
        nome: client?.name ?? "",
        guiche:
          servicePoint && sector ? `${servicePoint.name} - ${sector.name}` : "",
        chamadoEm: chamadoEmDate.toISOString(),
        prioridade: ticket ? getPriorityLabel(ticket.priority) : "Comum",
      };
    }),
  );

  // Ordena o resultado do mais atual para o mais antigo
  result.sort(
    (a, b) => new Date(b.chamadoEm).getTime() - new Date(a.chamadoEm).getTime(),
  );

  // Limita para os 5 mais recentes
  const top5 = result.slice(0, 5);

  const panelServerUrl = process.env.PANEL_SERVER_URL;
  if (!panelServerUrl) {
    console.warn("PANEL_SERVER_URL não está definido no .env");
    return { success: false };
  }

  // Envia para o servidor HTTP
  try {
    const response = await fetch(`${panelServerUrl}/call`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(top5),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Erro desconhecido");
      console.error(
        `Erro ao enviar últimas chamadas para o painel: ${response.status} ${response.statusText}`,
        errorText,
      );
      return { success: false };
    }

    const responseData = await response.json().catch(() => null);
    console.log(
      "Últimas chamadas enviadas com sucesso para o painel:",
      responseData,
    );
    return { success: true };
  } catch (error) {
    console.error("Erro ao enviar últimas chamadas para o painel:", error);
    if (error instanceof Error) {
      console.error("Stack trace:", error.stack);
    }
    return { success: false };
  }
}
