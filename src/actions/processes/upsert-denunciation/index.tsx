"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { denunciationsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import {
  CreateDenunciationSchema,
  ErrorMessages,
  ErrorTypes,
  UpdateDenunciationSchema,
} from "./schema";

export const updateDenunciation = actionClient
  .schema(UpdateDenunciationSchema)
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

    await db
      .update(denunciationsTable)
      .set({
        denunciationNumber: parsedInput.denunciationNumber,
        authorizationArquive: parsedInput.authorizationArquive,
      })
      .where(eq(denunciationsTable.id, parsedInput.id));

    revalidatePath("/atendimento");
  });

export const createDenunciation = actionClient
  .schema(CreateDenunciationSchema)
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

    await db.insert(denunciationsTable).values({
      denunciationNumber: parsedInput.denunciationNumber,
      authorizationArquive: parsedInput.authorizationArquive,
      treatmentId: parsedInput.treatmentId,
      ticketId: parsedInput.ticketId,
    });

    revalidatePath("/atendimento");
  });
