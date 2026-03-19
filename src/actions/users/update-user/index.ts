"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { adminActionClient } from "@/lib/next-safe-action";
import { pusherServer } from "@/lib/pusher-server";
import { REALTIME_CHANNELS, REALTIME_EVENTS } from "@/lib/realtime";

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
    void pusherServer
      .trigger(REALTIME_CHANNELS.professionals, REALTIME_EVENTS.professionalsChanged, {
        userId: parsedInput.id,
      })
      .catch(() => {});
  });
