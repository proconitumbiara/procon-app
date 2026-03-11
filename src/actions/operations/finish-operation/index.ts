"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { operationsTable, servicePointsTable } from "@/db/schema";
import { authActionClient } from "@/lib/next-safe-action";

import { ErrorMessages, ErrorTypes } from "./schema";
import { schema } from "./schema";

export const finishOperation = authActionClient
  .schema(schema)
  .action(async ({ parsedInput }) => {
    const operation = await db.query.operationsTable.findFirst({
      where: eq(operationsTable.id, parsedInput.operationId),
    });

    if (!operation) {
      return {
        error: {
          type: ErrorTypes.OPERATION_NOT_FOUND,
          message: ErrorMessages[ErrorTypes.OPERATION_NOT_FOUND],
        },
      };
    }

    await db
      .update(operationsTable)
      .set({
        status: "finished",
        finishedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(operationsTable.id, parsedInput.operationId));

    await db
      .update(servicePointsTable)
      .set({ availability: "free" })
      .where(eq(servicePointsTable.id, operation.servicePointId));

    revalidatePath("/atendimento");
  });
