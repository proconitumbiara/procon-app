"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { ticketsTable, treatmentsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { EndServiceSchema } from "./schema";
import { ErrorMessages, ErrorTypes } from "./schema";

export const endService = actionClient
  .schema(EndServiceSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      return {
        error: {
          type: ErrorTypes.UNAUTHENTICATED,
          message: ErrorMessages[ErrorTypes.UNAUTHENTICATED],
        },
      };
    }

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

    // Calcular duração do atendimento
    const start =
      treatment.createdAT instanceof Date
        ? treatment.createdAT
        : new Date(treatment.createdAT);
    const end = new Date();
    const durationMs = end.getTime() - start.getTime();
    const durationMinutes = Math.floor(durationMs / 60000); // duração em minutos

    // Atualizar status do ticket relacionado para "finished"
    if (treatment.ticketId) {
      await db
        .update(ticketsTable)
        .set({ status: "finished" })
        .where(eq(ticketsTable.id, treatment.ticketId));
    }

    await db
      .update(treatmentsTable)
      .set({ status: "finished", duration: durationMinutes })
      .where(eq(treatmentsTable.id, treatment.id));

    revalidatePath("/users/professionals-services");
  });
