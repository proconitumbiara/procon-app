"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { sectorsTable } from "@/db/schema";
import { adminActionClient } from "@/lib/next-safe-action";

import { ErrorMessages, ErrorTypes, upsertSectorSchema } from "./schema";

export const upsertSector = adminActionClient
  .schema(upsertSectorSchema)
  .action(async ({ parsedInput }) => {
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
    revalidatePath("/setores");
  });
