"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { operationsTable, ticketsTable, treatmentsTable } from "@/db/schema";
import { authActionClient } from "@/lib/next-safe-action";

import { CancelTreatmentAndTicketSchema } from "./schema";
import { ErrorMessages, ErrorTypes } from "./schema";

export const cancelTreatmentAndTicket = authActionClient
  .schema(CancelTreatmentAndTicketSchema)
  .action(async ({ parsedInput }) => {
    const treatment = await db.query.treatmentsTable.findFirst({
      where: eq(treatmentsTable.id, parsedInput.treatmentId),
    });
    if (!treatment) {
      return {
        error: {
          type: ErrorTypes.TREATMENT_NOT_FOUND,
          message: ErrorMessages[ErrorTypes.TREATMENT_NOT_FOUND],
        },
      };
    }

    if (treatment.status !== "in_service") {
      return {
        error: {
          type: ErrorTypes.TREATMENT_NOT_IN_SERVICE,
          message: ErrorMessages[ErrorTypes.TREATMENT_NOT_IN_SERVICE],
        },
      };
    }

    const ticket = await db.query.ticketsTable.findFirst({
      where: eq(ticketsTable.id, parsedInput.ticketId),
    });
    if (!ticket) {
      return {
        error: {
          type: ErrorTypes.TICKET_NOT_FOUND,
          message: ErrorMessages[ErrorTypes.TICKET_NOT_FOUND],
        },
      };
    }

    const start =
      (treatment.startedAt instanceof Date
        ? treatment.startedAt
        : treatment.startedAt
          ? new Date(treatment.startedAt)
          : treatment.createdAt instanceof Date
            ? treatment.createdAt
            : new Date(treatment.createdAt));
    const end = new Date();
    const durationMs = end.getTime() - start.getTime();
    const durationMinutes = Math.floor(durationMs / 60000);

    await db
      .update(ticketsTable)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(eq(ticketsTable.id, parsedInput.ticketId));

    await db
      .update(treatmentsTable)
      .set({
        status: "cancelled",
        duration: durationMinutes,
        finishedAt: end,
        updatedAt: new Date(),
      })
      .where(eq(treatmentsTable.id, treatment.id));

    await db
      .update(operationsTable)
      .set({ status: "operating", updatedAt: new Date() })
      .where(eq(operationsTable.id, treatment.operationId));

    revalidatePath("/atendimento");
    revalidatePath("/atendimentos-pendentes");
  });
