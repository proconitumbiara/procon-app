"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { operationsTable, pausesTable } from "@/db/schema";
import { authActionClient } from "@/lib/next-safe-action";

import { ErrorMessages, ErrorTypes, schema } from "./schema";

export const endPause = authActionClient
  .schema(schema)
  .action(async ({ parsedInput, ctx }) => {
    const { session } = ctx;

    const pause = await db.query.pausesTable.findFirst({
      where: eq(pausesTable.id, parsedInput.pauseId),
      with: {
        operation: true,
      },
    });

    if (!pause || pause.operation.userId !== session.user.id) {
      return {
        error: {
          type: ErrorTypes.PAUSE_NOT_FOUND,
          message: ErrorMessages[ErrorTypes.PAUSE_NOT_FOUND],
        },
      };
    }

    if (pause.status !== "in_progress") {
      return {
        error: {
          type: ErrorTypes.PAUSE_NOT_IN_PROGRESS,
          message: ErrorMessages[ErrorTypes.PAUSE_NOT_IN_PROGRESS],
        },
      };
    }

    const finishedAt = new Date();
    const start =
      pause.createdAt instanceof Date
        ? pause.createdAt
        : new Date(pause.createdAt);
    const durationMs = finishedAt.getTime() - start.getTime();
    const durationMinutes = Math.floor(durationMs / 60000);

    await db
      .update(pausesTable)
      .set({
        finishedAt,
        duration: durationMinutes,
        status: "finished",
        updatedAt: new Date(),
      })
      .where(eq(pausesTable.id, pause.id));

    await db
      .update(operationsTable)
      .set({ status: "operating", updatedAt: new Date() })
      .where(eq(operationsTable.id, pause.operationId));

    revalidatePath("/atendimento");

    return { success: true };
  });
