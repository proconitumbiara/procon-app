"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import { categoriesTable, usersTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { ErrorMessages, ErrorTypes, upsertCategorySchema } from "./schema";

export const upsertCategory = actionClient
  .schema(upsertCategorySchema)
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

    const [category] = await db
      .insert(categoriesTable)
      .values({
        id: parsedInput.id,
        name: parsedInput.name.trim(),
      })
      .onConflictDoUpdate({
        target: [categoriesTable.id],
        set: {
          name: parsedInput.name.trim(),
          updatedAt: new Date(),
        },
      })
      .returning({
        id: categoriesTable.id,
        name: categoriesTable.name,
      });

    return { success: true, category };
  });


