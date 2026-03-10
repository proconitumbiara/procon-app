"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { operationsTable, servicePointsTable } from "@/db/schema";
import { authActionClient } from "@/lib/next-safe-action";

import { ErrorMessages, ErrorTypes, schema } from "./schema";

export const startOperation = authActionClient
  .schema(schema)
  .action(async ({ parsedInput, ctx }) => {
    const { session } = ctx;

    const existingOperation = await db.query.operationsTable.findFirst({
      where: and(
        eq(operationsTable.userId, session.user.id),
        eq(operationsTable.status, "operating"),
      ),
    });

    if (existingOperation) {
      return {
        error: {
          type: ErrorTypes.OPERATION_ALREADY_ACTIVE,
          message: ErrorMessages[ErrorTypes.OPERATION_ALREADY_ACTIVE],
        },
      };
    }

    await db.insert(operationsTable).values({
      status: "operating",
      userId: session.user.id,
      servicePointId: parsedInput.servicePointId,
    });

    await db
      .update(servicePointsTable)
      .set({ availability: "operating" })
      .where(eq(servicePointsTable.id, parsedInput.servicePointId));

    revalidatePath("/atendimento");

    return { success: true };
  });
