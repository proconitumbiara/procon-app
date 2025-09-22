"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { sectorsTable, usersTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { ErrorMessages, ErrorTypes, upsertSectorSchema } from "./schema";

export const upsertSector = actionClient
  .schema(upsertSectorSchema)
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
      .insert(sectorsTable)
      .values({
        ...parsedInput,
      })
      .onConflictDoUpdate({
        target: [sectorsTable.id],
        set: {
          ...parsedInput,
        },
      });
    revalidatePath("/administrator/sectors");
  });
