"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { servicePointsTable, usersTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { ErrorMessages, ErrorTypes, upsertServicePointSchema } from "./schema";

export const upsertServicePoint = actionClient
  .schema(upsertServicePointSchema)
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
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, session.user.id),
    });
    if (user?.role !== "administrator") {
      return {
        error: {
          type: ErrorTypes.USER_NOT_AUTHORIZED,
          message: ErrorMessages[ErrorTypes.USER_NOT_AUTHORIZED],
        },
      };
    }
    await db
      .insert(servicePointsTable)
      .values({
        ...parsedInput,
      })
      .onConflictDoUpdate({
        target: [servicePointsTable.id],
        set: {
          ...parsedInput,
        },
      });
    revalidatePath("/users/sectors");
  });
