"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { operationsTable, pausesTable, treatmentsTable } from "@/db/schema";
import { authActionClient } from "@/lib/next-safe-action";

import { ErrorMessages, ErrorTypes, schema } from "./schema";

export const startPause = authActionClient
  .schema(schema)
  .action(async ({ parsedInput, ctx }) => {
    const { session } = ctx;

    const operation = await db.query.operationsTable.findFirst({
      where: and(
        eq(operationsTable.userId, session.user.id),
        eq(operationsTable.status, "operating"),
      ),
    });

    if (!operation) {
      return {
        error: {
          type: ErrorTypes.NO_OPERATING_OPERATION,
          message: ErrorMessages[ErrorTypes.NO_OPERATING_OPERATION],
        },
      };
    }

    const treatmentInProgress = await db.query.treatmentsTable.findFirst({
      where: and(
        eq(treatmentsTable.operationId, operation.id),
        eq(treatmentsTable.status, "in_service"),
      ),
    });

    if (treatmentInProgress) {
      return {
        error: {
          type: ErrorTypes.TREATMENT_IN_PROGRESS,
          message: ErrorMessages[ErrorTypes.TREATMENT_IN_PROGRESS],
        },
      };
    }

    await db.insert(pausesTable).values({
      operationId: operation.id,
      reason: parsedInput.reason,
      duration: 0,
      status: "in_progress",
      createdAt: new Date(),
    });

    await db
      .update(operationsTable)
      .set({ status: "paused", updatedAt: new Date() })
      .where(eq(operationsTable.id, operation.id));

    revalidatePath("/atendimento");

    return { success: true };
  });
