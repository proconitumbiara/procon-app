"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { operationsTable, servicePointsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { ErrorMessages, ErrorTypes, schema } from "./schema";

export const startOperation = actionClient
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

    await db.insert(operationsTable).values({
      status: "operating",
      userId: session.user.id,
      servicePointId: parsedInput.servicePointId,
    });

    // Atualiza o status do ponto de serviço para 'busy'
    await db
      .update(servicePointsTable)
      .set({ availability: "busy" })
      .where(eq(servicePointsTable.id, parsedInput.servicePointId));

    revalidatePath("/users/professionals-services");
  });
