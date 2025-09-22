"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { ErrorMessages, ErrorTypes, schema } from "./schema";

export const updateUser = actionClient
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
      .update(usersTable)
      .set({
        name: parsedInput.name,
        phoneNumber: parsedInput.phoneNumber,
        cpf: parsedInput.cpf,
        role: parsedInput.role,
      })
      .where(eq(usersTable.id, parsedInput.id));

    revalidatePath("/users/users-professionals");
  });
