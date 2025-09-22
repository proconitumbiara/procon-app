"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { operationsTable, servicePointsTable } from "@/db/schema";
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
