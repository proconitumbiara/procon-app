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
    avgDurationResult,
    avgWaitingResult,
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
        and(
          gte(clientsTable.createdAt, from),
          lte(clientsTable.createdAt, to),
        ),
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

    // Média de duração dos atendimentos no período (calculado via SQL para evitar
    // trazer todas as linhas para o Node.js)
    db
      .select({
        avg: sql<string>`COALESCE(ROUND(AVG(${treatmentsTable.duration})), 0)`,
      })
      .from(treatmentsTable)
      .where(
        and(dateFilter, isNotNull(treatmentsTable.duration)),
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
  ]);

  return {
    topProfessionals: topProfessionals.filter(
      (p) => !!p.professionalId && !!p.name,
    ),
    totalTreatments: totalTreatmentsResult[0]?.total ?? 0,
    totalNewClients: totalNewClientsResult[0]?.total ?? 0,
    totalCanceledTickets: totalCanceledTicketsResult[0]?.total ?? 0,
    averageTreatmentDuration: Number(avgDurationResult[0]?.avg ?? 0),
    averageWaitingTimeMinutes: Number(avgWaitingResult[0]?.avg ?? 0),
  };
};

export default getDashboard;
