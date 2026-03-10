"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { servicePointsTable } from "@/db/schema";
import { adminActionClient } from "@/lib/next-safe-action";

export const deleteServicePoint = adminActionClient
  .schema(
    z.object({
      id: z.string().uuid(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const servicePoint = await db.query.servicePointsTable.findFirst({
      where: eq(servicePointsTable.id, parsedInput.id),
    });
    if (!servicePoint) {
      throw new Error("Ponto de atendimento não encontrado");
    }
    await db
      .delete(servicePointsTable)
      .where(eq(servicePointsTable.id, parsedInput.id));
    revalidatePath("/setores");
  });
