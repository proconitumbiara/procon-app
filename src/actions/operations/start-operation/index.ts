"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { operationsTable, servicePointsTable } from "@/db/schema";
import { authActionClient } from "@/lib/next-safe-action";

import { ErrorMessages, ErrorTypes, schema } from "./schema";

export const startOperation = authActionClient
  .schema(schema)
  .action(async ({ parsedInput, ctx }) => {
    const { session } = ctx;

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
