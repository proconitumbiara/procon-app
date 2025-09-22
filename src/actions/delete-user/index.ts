"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

export const deleteUser = actionClient
  .schema(
    z.object({
      id: z.string(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      throw new Error("Unauthorized");
    }
    // Verificar se o usuário é administrador
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, session.user.id),
    });
    if (user?.role !== "administrator") throw new Error("Unauthorized");
    await db.delete(usersTable).where(eq(usersTable.id, parsedInput.id));
    revalidatePath("/users/users-professionals");
  });
