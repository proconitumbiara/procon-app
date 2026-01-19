"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

import { ErrorMessages, ErrorTypes, updateUserDataSchema } from "./schema";

export const updateUserData = actionClient
  .schema(updateUserDataSchema)
  .action(async ({ parsedInput }) => {
    try {
      await db
        .update(usersTable)
        .set({
          cpf: parsedInput.cpf,
          phoneNumber: parsedInput.phoneNumber,
          role: parsedInput.role || "admin",
          updatedAt: new Date(),
        })
        .where(eq(usersTable.id, parsedInput.userId));

      return { success: true };
    } catch {
      return {
        error: {
          type: ErrorTypes.UPDATE_USER_DATA_ERROR,
          message: ErrorMessages[ErrorTypes.UPDATE_USER_DATA_ERROR],
        },
      };
    }
  });
