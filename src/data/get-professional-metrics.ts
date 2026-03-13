import { and, eq, gte, lte } from "drizzle-orm";

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

  const pauseDateFilter =
    from && to
      ? and(
          gte(pausesTable.createdAt, from),
          lte(pausesTable.createdAt, to),
        )
      : undefined;

  const operationsWithTreatments = await db.query.operationsTable.findMany({
    where: and(eq(operationsTable.userId, professionalId), dateFilter),
    with: {
      treatments: {
        where: treatmentDateFilter,
        with: {
          ticket: {
            with: {
              client: true,
              sector: true,
            },
          },
        },
      },
      pauses: {
        where: pauseDateFilter,
      },
      servicePoint: true,
    },
  });

  const totalOperations = operationsWithTreatments.length;

  const operationDurations = operationsWithTreatments
    .map((op) => {
      const start =
        op.createdAt instanceof Date ? op.createdAt : new Date(op.createdAt);
      const end =
        op.status === "finished" && op.finishedAt
          ? op.finishedAt instanceof Date
            ? op.finishedAt
            : new Date(op.finishedAt)
          : op.updatedAt instanceof Date
            ? op.updatedAt
            : new Date(op.updatedAt ?? op.createdAt);
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

  const allTreatmentsWithOperation = operationsWithTreatments.flatMap((op) =>
    op.treatments.map((t) => ({ ...t, operation: op })),
  );

  const sortedFinishedTreatments = allTreatmentsWithOperation
    .filter((t) => t.status === "finished" && t.startedAt && t.finishedAt)
    .map((t) => ({
      startedAt:
        t.startedAt instanceof Date ? t.startedAt : new Date(t.startedAt),
      finishedAt:
        t.finishedAt instanceof Date ? t.finishedAt : new Date(t.finishedAt),
    }))
    .sort((a, b) => a.startedAt.getTime() - b.startedAt.getTime());

  const gapsBetweenTreatments: number[] = [];
  for (let i = 1; i < sortedFinishedTreatments.length; i++) {
    const prev = sortedFinishedTreatments[i - 1];
    const curr = sortedFinishedTreatments[i];
    const gapMs = curr.startedAt.getTime() - prev.finishedAt.getTime();
    if (gapMs > 0) {
      gapsBetweenTreatments.push(Math.round(gapMs / 60000));
    }
  }

  const averageTimeBetweenTreatments =
    gapsBetweenTreatments.length > 0
      ? Math.round(
          gapsBetweenTreatments.reduce((a, b) => a + b, 0) /
            gapsBetweenTreatments.length,
        )
      : 0;

  const allPausesWithOperation = operationsWithTreatments.flatMap((op) =>
    op.pauses.map((p) => ({ ...p, operationId: op.id, operationCreatedAt: op.createdAt })),
  );

  const pausesForList = allPausesWithOperation.map((p) => ({
    id: p.id,
    reason: p.reason,
    duration: p.duration,
    status: p.status,
    createdAt: p.createdAt,
    finishedAt: p.finishedAt ?? null,
    operationId: p.operationId,
    operationCreatedAt: p.operationCreatedAt,
  }));

  const totalPauses = allPausesWithOperation.length;
  const averagePausesPerOperation =
    totalOperations > 0
      ? Math.round((totalPauses / totalOperations) * 10) / 10
      : 0;

  const treatmentsForList = allTreatmentsWithOperation.map((t) => {
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
    const durationMinutes = t.duration != null ? t.duration : null;

    return {
      id: t.id,
      duration: durationMinutes,
      status: t.status,
      startedAt: t.startedAt ?? null,
      finishedAt: t.finishedAt ?? null,
      clientName: t.ticket?.client?.name ?? "-",
      sectorName: t.ticket?.sector?.name ?? "-",
      servicePointName: t.operation?.servicePoint?.name ?? "-",
      ticketCreatedAt: t.ticket?.createdAt ?? null,
      ticketCalledAt: t.ticket?.calledAt ?? null,
      ticketFinishedAt: t.ticket?.finishedAt ?? null,
      ticketStatus: t.ticket?.status ?? null,
      treatmentStartedAt: t.startedAt ?? null,
      treatmentFinishedAt: t.finishedAt ?? null,
      waitingTimeMinutes,
    };
  });

  return {
    totalOperations,
    averageOperationTime,
    totalTreatments,
    averageTreatmentTime,
    totalPauses,
    averagePausesPerOperation,
    averageTimeBetweenTreatments,
    operations: operationsWithTreatments,
    treatments: treatmentsForList,
    pauses: pausesForList,
  };
};
