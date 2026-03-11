"use server";

import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  operationsTable,
  ticketsTable,
  treatmentsTable,
} from "@/db/schema";
import { authActionClient } from "@/lib/next-safe-action";
import { sendToPanel } from "@/lib/panel-api";
import { getPriorityLabel } from "@/lib/priority-utils";

export const callTheCustomerAgain = authActionClient.action(
  async ({ ctx }) => {
    const { session } = ctx;

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

    if (!operation) {
      return { error: "Nenhuma operação ativa encontrada" };
    }

    const treatment = await db.query.treatmentsTable.findFirst({
      where: and(
        eq(treatmentsTable.operationId, operation.id),
        eq(treatmentsTable.status, "in_service"),
      ),
      with: {
        ticket: {
          with: {
            client: true,
          },
        },
      },
    });

    if (!treatment) {
      return { error: "Nenhum atendimento em andamento encontrado" };
    }

    const client = treatment.ticket?.client;
    if (!client) {
      return { error: "Cliente não encontrado" };
    }

    const servicePoint = operation.servicePoint;
    if (!servicePoint) {
      return { error: "Ponto de serviço não encontrado" };
    }

    const sector = servicePoint.sector;
    if (!sector) {
      return { error: "Setor não encontrado" };
    }

    void sendToPanel({
      nome: client.name,
      guiche: `${servicePoint.name} - ${sector.name}`,
      prioridade: treatment.ticket
        ? getPriorityLabel(treatment.ticket.priority)
        : "Comum",
      chamadoEm: new Date().toISOString(),
    }).catch((err) => console.error("[callTheCustomerAgain] sendToPanel:", err));

    return { success: true };
  },
);
