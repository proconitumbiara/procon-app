"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { adminActionClient } from "@/lib/next-safe-action";

import { ErrorMessages, ErrorTypes, schema } from "./schema";

export const updateUser = adminActionClient
  .schema(schema)
  .action(async ({ parsedInput }) => {
    await db
      .update(usersTable)
      .set({
        name: parsedInput.name,
        phoneNumber: parsedInput.phoneNumber,
        cpf: parsedInput.cpf,
        role: parsedInput.role,
      })
      .where(eq(usersTable.id, parsedInput.id));

    revalidatePath("/profissionais");
  });
