"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { operationsTable, pausesTable, servicePointsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { ErrorMessages, ErrorTypes } from "./schema";
import { schema } from "./schema";

export const finishOperation = actionClient
  .schema(schema)
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

    await db
      .update(operationsTable)
      .set({
        status: "finished",
        updatedAt: new Date(),
      })
      .where(eq(operationsTable.id, parsedInput.operationId));

    // Buscar e finalizar pausas in-progress da operação
    const pauses = await db.query.pausesTable.findMany({
      where: and(
        eq(pausesTable.operationId, parsedInput.operationId),
        eq(pausesTable.status, "in-progress"),
      ),
    });

    // Atualizar pausas in-progress para finished e calcular duração
    for (const pause of pauses) {
      const start =
        pause.createdAT instanceof Date
          ? pause.createdAT
          : new Date(pause.createdAT);
      const end = new Date();
      const durationMs = end.getTime() - start.getTime();
      const durationMinutes = Math.floor(durationMs / 60000); // duração em minutos

      await db
        .update(pausesTable)
        .set({
          status: "finished",
          duration: durationMinutes,
        })
        .where(eq(pausesTable.id, pause.id));
    }

    // Buscar a operação para obter o servicePointId
    const operation = await db.query.operationsTable.findFirst({
      where: eq(operationsTable.id, parsedInput.operationId),
    });
    if (operation) {
      await db
        .update(servicePointsTable)
        .set({ availability: "free" })
        .where(eq(servicePointsTable.id, operation.servicePointId));
    }

    revalidatePath("/users/professionals-services");
  });
