import { and, count, desc, eq, gte, isNotNull, lte, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  clientsTable,
  operationsTable,
  ticketsTable,
  treatmentsTable,
  usersTable,
} from "@/db/schema";

interface Params {
  from: Date;
  to: Date;
}

const getDashboard = async ({ from, to }: Params) => {
  const dateFilter = and(
    gte(treatmentsTable.createdAt, from),
    lte(treatmentsTable.createdAt, to),
  );

  const [
    topProfessionals,
    totalTreatmentsResult,
    totalNewClientsResult,
    totalCanceledTicketsResult,
    avgTreatmentDurationResult,
    avgWaitingResult,
    avgTotalWaitingResult,
    treatmentsRaw,
  ] = await Promise.all([
    // Ranking de profissionais filtrado pelo período selecionado
    db
      .select({
        professionalId: operationsTable.userId,
        name: usersTable.name,
        total: count(treatmentsTable.id).as("total"),
      })
      .from(treatmentsTable)
      .leftJoin(
        operationsTable,
        eq(treatmentsTable.operationId, operationsTable.id),
      )
      .leftJoin(usersTable, eq(operationsTable.userId, usersTable.id))
      .where(dateFilter)
      .groupBy(operationsTable.userId, usersTable.name)
      .orderBy(desc(sql<number>`count(*)`)),

    // Total de atendimentos realizados no período
    db
      .select({ total: count(treatmentsTable.id) })
      .from(treatmentsTable)
      .where(dateFilter),

    // Total de novos clientes cadastrados no período
    db
      .select({ total: count(clientsTable.id) })
      .from(clientsTable)
      .where(
        and(gte(clientsTable.createdAt, from), lte(clientsTable.createdAt, to)),
      ),

    // Total de tickets cancelados no período
    db
      .select({ total: count(ticketsTable.id) })
      .from(ticketsTable)
      .where(
        and(
          gte(ticketsTable.createdAt, from),
          lte(ticketsTable.createdAt, to),
          eq(ticketsTable.status, "cancelled"),
        ),
      ),

    // Média de tempo de atendimento (calledAt → finishedAt) no período
    db
      .select({
        avg: sql<string>`
          COALESCE(
            ROUND(
              AVG(
                GREATEST(
                  0,
                  EXTRACT(EPOCH FROM (${ticketsTable.finishedAt} - ${ticketsTable.calledAt})) / 60
                )
              )
            ),
            0
          )
        `,
      })
      .from(treatmentsTable)
      .innerJoin(ticketsTable, eq(treatmentsTable.ticketId, ticketsTable.id))
      .where(
        and(
          dateFilter,
          isNotNull(ticketsTable.calledAt),
          isNotNull(ticketsTable.finishedAt),
        ),
      ),

    // Média de tempo de espera no período
    // (diferença entre o ticket entrar na fila e o atendimento ser iniciado)
    db
      .select({
        avg: sql<string>`
          COALESCE(
            ROUND(
              AVG(
                GREATEST(
                  0,
                  EXTRACT(EPOCH FROM (${treatmentsTable.createdAt} - ${ticketsTable.createdAt})) / 60
                )
              )
            ),
            0
          )
        `,
      })
      .from(treatmentsTable)
      .innerJoin(ticketsTable, eq(treatmentsTable.ticketId, ticketsTable.id))
      .where(dateFilter),

    // Média de tempo total de espera (createdAt → finishedAt) no período
    db
      .select({
        avg: sql<string>`
          COALESCE(
            ROUND(
              AVG(
                GREATEST(
                  0,
                  EXTRACT(EPOCH FROM (${ticketsTable.finishedAt} - ${ticketsTable.createdAt})) / 60
                )
              )
            ),
            0
          )
        `,
      })
      .from(treatmentsTable)
      .innerJoin(ticketsTable, eq(treatmentsTable.ticketId, ticketsTable.id))
      .where(and(dateFilter, isNotNull(ticketsTable.finishedAt))),

    // Listagem de todos os atendimentos do período (para o dashboard)
    db.query.treatmentsTable.findMany({
      where: dateFilter,
      orderBy: (t, { desc }) => [desc(t.createdAt)],
      with: {
        ticket: {
          with: {
            client: true,
            sector: true,
          },
        },
        operation: {
          with: {
            user: true,
            servicePoint: {
              with: {
                sector: true,
              },
            },
          },
        },
      },
    }),
  ]);

  const treatments = treatmentsRaw.map((t) => {
    const ticketCreatedAt = t.ticket?.createdAt
      ? new Date(t.ticket.createdAt).getTime()
      : null;
    const calledAt = t.ticket?.calledAt
      ? new Date(t.ticket.calledAt).getTime()
      : null;
    const treatmentStartedAt = t.startedAt
      ? new Date(t.startedAt).getTime()
      : null;
    const waitingTimeMs =
      ticketCreatedAt != null && (calledAt != null || treatmentStartedAt != null)
        ? (calledAt ?? treatmentStartedAt!) - ticketCreatedAt
        : null;
    const waitingTimeMinutes =
      waitingTimeMs != null ? Math.round(waitingTimeMs / 60000) : null;
    const durationMinutes =
      t.duration != null ? Math.round(t.duration / 60) : null;

    return {
      id: t.id,
      clientName: t.ticket?.client?.name ?? "-",
      sectorName: t.ticket?.sector?.name ?? "-",
      ticketCreatedAt: t.ticket?.createdAt ?? null,
      ticketCalledAt: t.ticket?.calledAt ?? null,
      ticketFinishedAt: t.ticket?.finishedAt ?? null,
      ticketStatus: t.ticket?.status ?? null,
      durationMinutes,
      treatmentStartedAt: t.startedAt ?? null,
      treatmentFinishedAt: t.finishedAt ?? null,
      treatmentStatus: t.status,
      professionalName: t.operation?.user?.name ?? "-",
      servicePointName: t.operation?.servicePoint?.name ?? "-",
      waitingTimeMinutes,
    };
  });

  return {
    topProfessionals: topProfessionals.filter(
      (p) => !!p.professionalId && !!p.name,
    ),
    totalTreatments: totalTreatmentsResult[0]?.total ?? 0,
    totalNewClients: totalNewClientsResult[0]?.total ?? 0,
    totalCanceledTickets: totalCanceledTicketsResult[0]?.total ?? 0,
    averageTreatmentDuration: Number(avgTreatmentDurationResult[0]?.avg ?? 0),
    averageWaitingTimeMinutes: Number(avgWaitingResult[0]?.avg ?? 0),
    averageTotalWaitingTimeMinutes: Number(avgTotalWaitingResult[0]?.avg ?? 0),
    treatments,
  };
};

export default getDashboard;
