"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { sectorsTable } from "@/db/schema";
import { adminActionClient } from "@/lib/next-safe-action";

export const deleteSector = adminActionClient
  .schema(
    z.object({
      id: z.string().uuid(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const sector = await db.query.sectorsTable.findFirst({
      where: eq(sectorsTable.id, parsedInput.id),
    });
    if (!sector) {
      throw new Error("Setor não encontrado");
    }

    await db.delete(sectorsTable).where(eq(sectorsTable.id, parsedInput.id));
    revalidatePath("/setores");
  });
