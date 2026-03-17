"use server";

import { and, eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import {
  operationsTable,
  ticketsTable,
  treatmentsTable,
} from "@/db/schema";
import { permissionedActionClient } from "@/lib/next-safe-action";
import { sendToPanel } from "@/lib/panel-api";
import { getPriorityLabel } from "@/lib/priority-utils";

export const callTheCustomerAgain = permissionedActionClient("treatments.manage").action(
  async ({ ctx }) => {
    const { session, perms } = ctx;

    const operation = await db.query.operationsTable.findFirst({
      where: and(
        eq(operationsTable.userId, session.user.id),
        inArray(operationsTable.status, ["operating", "in-attendance"]),
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

    if (!perms.canAccessSectorKey(sector.key_name)) {
      return { error: "Acesso negado para este setor" };
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
