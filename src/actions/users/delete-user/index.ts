"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { adminActionClient } from "@/lib/next-safe-action";

export const deleteUser = adminActionClient
  .schema(
    z.object({
      id: z.string(),
    }),
  )
  .action(async ({ parsedInput }) => {
    await db.delete(usersTable).where(eq(usersTable.id, parsedInput.id));
    revalidatePath("/profissionais");
  });
