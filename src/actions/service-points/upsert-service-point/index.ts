"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { servicePointsTable } from "@/db/schema";
import { adminActionClient } from "@/lib/next-safe-action";

import { ErrorMessages, ErrorTypes, upsertServicePointSchema } from "./schema";

export const upsertServicePoint = adminActionClient
  .schema(upsertServicePointSchema)
  .action(async ({ parsedInput }) => {
    const { availability, ...restOfData } = parsedInput;

    const insertValues = {
      ...parsedInput,
      availability: availability ?? "free",
    };

    const updateData = {
      ...restOfData,
      ...(availability !== undefined && { availability }),
    };

    await db
      .insert(servicePointsTable)
      .values(insertValues)
      .onConflictDoUpdate({
        target: [servicePointsTable.id],
        set: updateData,
      });
    revalidatePath("/setores");
  });
