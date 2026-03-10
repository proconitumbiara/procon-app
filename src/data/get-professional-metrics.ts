import { and, eq, gte, lte } from "drizzle-orm";

import { db } from "@/db";
import { operationsTable, treatmentsTable } from "@/db/schema";

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
  const dateFilter =
    from && to
      ? and(
          gte(operationsTable.createdAt, from),
          lte(operationsTable.createdAt, to),
        )
      : undefined;

  const treatmentDateFilter =
    from && to
      ? and(
          gte(treatmentsTable.createdAt, from),
          lte(treatmentsTable.createdAt, to),
        )
      : undefined;

  const operationsWithTreatments = await db.query.operationsTable.findMany({
    where: and(eq(operationsTable.userId, professionalId), dateFilter),
    with: {
      treatments: {
        where: treatmentDateFilter,
      },
    },
  });

  const totalOperations = operationsWithTreatments.length;

  const operationDurations = operationsWithTreatments
    .map((op) => {
      const start =
        op.createdAt instanceof Date ? op.createdAt : new Date(op.createdAt);
      const end =
        op.updatedAt instanceof Date
          ? op.updatedAt
          : new Date(op.updatedAt || op.createdAt);
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
        )
      : 0;

  const allTreatments = operationsWithTreatments.flatMap(
    (op) => op.treatments,
  );
  const totalTreatments = allTreatments.length;

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
    totalTreatments,
    averageTreatmentTime,
    operations: operationsWithTreatments,
    treatments: allTreatments,
  };
};
