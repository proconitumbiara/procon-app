import { and, eq, gte, lte, or } from "drizzle-orm";

import { db } from "@/db";
import { operationsTable, pausesTable, treatmentsTable } from "@/db/schema";

interface ProfessionalMetricsParams {
  professionalId: string;
  from?: Date;
  to?: Date;
}

export const getProfessionalMetrics = async ({
  professionalId,
  from,
  to,
}: ProfessionalMetricsParams) => {
  // Se não especificadas as datas, buscar todos os dados
  const dateFilter =
    from && to
      ? and(
          gte(operationsTable.createdAT, from),
          lte(operationsTable.createdAT, to),
        )
      : undefined;

  // Buscar operações do profissional
  const operations = await db
    .select()
    .from(operationsTable)
    .where(and(eq(operationsTable.userId, professionalId), dateFilter));

  // Se há filtro de data, também filtrar tratamentos e pausas pelo período
  const treatmentDateFilter =
    from && to
      ? and(
          gte(treatmentsTable.createdAT, from),
          lte(treatmentsTable.createdAT, to),
        )
      : undefined;

  const pauseDateFilter =
    from && to
      ? and(gte(pausesTable.createdAT, from), lte(pausesTable.createdAT, to))
      : undefined;

  // Buscar tratamentos e pausas para cada operação
  const operationsWithDetails = await Promise.all(
    operations.map(async (operation) => {
      const [treatments, pauses] = await Promise.all([
        db
          .select()
          .from(treatmentsTable)
          .where(
            and(
              eq(treatmentsTable.operationId, operation.id),
              treatmentDateFilter,
            ),
          ),
        db
          .select()
          .from(pausesTable)
          .where(
            and(eq(pausesTable.operationId, operation.id), pauseDateFilter),
          ),
      ]);

      return {
        ...operation,
        treatments,
        pauses,
      };
    }),
  );

  // Calcular métricas
  const totalOperations = operationsWithDetails.length;

  // Calcular tempo médio de operação
  const operationDurations = operationsWithDetails
    .map((op) => {
      const start =
        op.createdAT instanceof Date ? op.createdAT : new Date(op.createdAT);
      const end =
        op.updatedAt instanceof Date
          ? op.updatedAt
          : new Date(op.updatedAt || op.createdAT);
      const duration = end.getTime() - start.getTime();
      return duration > 0 ? duration : 0;
    })
    .filter((duration) => duration > 0);

  const averageOperationTime =
    operationDurations.length > 0
      ? Math.round(
          operationDurations.reduce((acc, duration) => acc + duration, 0) /
            operationDurations.length /
            60000,
        ) // em minutos
      : 0;

  // Calcular pausas
  const allPauses = operationsWithDetails.flatMap((op) => op.pauses);
  const totalPauses = allPauses.length;

  // Calcular tempo médio de pausas por motivo
  const pausesByReason = allPauses.reduce(
    (acc, pause) => {
      if (!acc[pause.reason]) {
        acc[pause.reason] = { count: 0, totalDuration: 0 };
      }
      acc[pause.reason].count++;
      if (pause.duration) {
        acc[pause.reason].totalDuration += pause.duration;
      }
      return acc;
    },
    {} as Record<string, { count: number; totalDuration: number }>,
  );

  const averagePauseTimeByReason = Object.entries(pausesByReason).map(
    ([reason, data]) => ({
      reason,
      count: data.count,
      averageTime:
        data.count > 0 ? Math.round(data.totalDuration / data.count) : 0,
    }),
  );

  const averagePauseTime =
    totalPauses > 0
      ? Math.round(
          allPauses
            .filter((p) => p.duration)
            .reduce((acc, pause) => acc + (pause.duration || 0), 0) /
            totalPauses,
        )
      : 0;

  // Calcular atendimentos
  const allTreatments = operationsWithDetails.flatMap((op) => op.treatments);
  const totalTreatments = allTreatments.length;

  // Calcular tempo médio de atendimento
  const treatmentDurations = allTreatments
    .map((treatment) => treatment.duration)
    .filter(
      (duration): duration is number =>
        duration !== null && duration !== undefined,
    );

  const averageTreatmentTime =
    treatmentDurations.length > 0
      ? Math.round(
          treatmentDurations.reduce((acc, duration) => acc + duration, 0) /
            treatmentDurations.length,
        )
      : 0;

  return {
    totalOperations,
    averageOperationTime,
    totalPauses,
    averagePauseTime,
    averagePauseTimeByReason,
    totalTreatments,
    averageTreatmentTime,
    operations: operationsWithDetails,
    treatments: allTreatments,
  };
};
