import { and, count, desc, eq, gte, lte, sql } from "drizzle-orm";

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
  // Top profissionais
  const topProfessionals = await db
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
    // Removido o filtro de data
    .groupBy(operationsTable.userId, usersTable.name)
    .orderBy(desc(sql<number>`count(*)`));

  // Total de atendimentos realizados no período
  const totalTreatments = await db
    .select({
      total: count(treatmentsTable.id),
    })
    .from(treatmentsTable)
    .where(
      and(
        gte(treatmentsTable.createdAT, from),
        lte(treatmentsTable.createdAT, to),
      ),
    )
    .then((res) => res[0]?.total || 0);

  // Total de novos clientes no período
  const totalNewClients = await db
    .select({
      total: count(clientsTable.id),
    })
    .from(clientsTable)
    .where(
      and(gte(clientsTable.createdAT, from), lte(clientsTable.createdAT, to)),
    )
    .then((res) => res[0]?.total || 0);

  // Total de atendimentos cancelados no período (tickets com status canceled)
  const totalCanceledTickets = await db
    .select({
      total: count(ticketsTable.id),
    })
    .from(ticketsTable)
    .where(
      and(
        gte(ticketsTable.createdAT, from),
        lte(ticketsTable.createdAT, to),
        eq(ticketsTable.status, "canceled"),
      ),
    )
    .then((res) => res[0]?.total || 0);

  // Média de tempo de atendimento
  const durations = await db
    .select({ duration: treatmentsTable.duration })
    .from(treatmentsTable);

  let averageTreatmentDuration = 0;

  const validDurations = durations
    .map((d) => d.duration)
    .filter((d): d is number => d !== null && d !== undefined);

  if (validDurations.length > 0) {
    const totalDuration = validDurations.reduce((acc, curr) => acc + curr, 0);
    averageTreatmentDuration = Math.round(
      totalDuration / validDurations.length,
    );
  }

  return {
    topProfessionals,
    totalTreatments,
    totalNewClients,
    totalCanceledTickets,
    averageTreatmentDuration,
  };
};

export default getDashboard;
