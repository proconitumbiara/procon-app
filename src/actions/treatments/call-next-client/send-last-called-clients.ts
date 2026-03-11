"use server";

import { desc } from "drizzle-orm";

import { db } from "@/db";
import type { ChamadaCliente } from "@/lib/panel-api";
import { sendLastCalledToPanel } from "@/lib/panel-api";
import { getPriorityLabel } from "@/lib/priority-utils";

import { treatmentsTable } from "@/db/schema";

/** Retorna as últimas 5 chamadas a partir do banco (reutilizado pela API do painel). */
export async function getUltimasChamadasFromDb(): Promise<ChamadaCliente[]> {
  const treatments = await db.query.treatmentsTable.findMany({
    orderBy: (t) => desc(t.createdAt),
    limit: 20,
    with: {
      ticket: {
        with: {
          client: true,
        },
      },
      operation: {
        with: {
          servicePoint: {
            with: {
              sector: true,
            },
          },
        },
      },
    },
  });

  const result = treatments.map((treatment) => {
    const client = treatment.ticket?.client;
    const servicePoint = treatment.operation?.servicePoint;
    const sector = servicePoint?.sector;

    const chamadoEmDate =
      treatment.createdAt instanceof Date
        ? treatment.createdAt
        : new Date(treatment.createdAt);

    return {
      nome: client?.name ?? "",
      guiche:
        servicePoint && sector ? `${servicePoint.name} - ${sector.name}` : "",
      chamadoEm: chamadoEmDate.toISOString(),
      prioridade: treatment.ticket
        ? getPriorityLabel(treatment.ticket.priority)
        : ("Comum" as const),
    };
  });

  result.sort(
    (a, b) => new Date(b.chamadoEm).getTime() - new Date(a.chamadoEm).getTime(),
  );

  return result.slice(0, 5);
}

export async function sendLastCalledClients() {
  const result = await getUltimasChamadasFromDb();
  await sendLastCalledToPanel(result);
}
