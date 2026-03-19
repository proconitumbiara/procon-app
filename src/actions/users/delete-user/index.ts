"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { adminActionClient } from "@/lib/next-safe-action";
import { pusherServer } from "@/lib/pusher-server";
import { REALTIME_CHANNELS, REALTIME_EVENTS } from "@/lib/realtime";

export const deleteUser = adminActionClient
  .schema(
    z.object({
      id: z.string(),
    }),
  )
  .action(async ({ parsedInput }) => {
    await db.delete(usersTable).where(eq(usersTable.id, parsedInput.id));
    revalidatePath("/profissionais");
    void pusherServer
      .trigger(REALTIME_CHANNELS.professionals, REALTIME_EVENTS.professionalsChanged, {
        userId: parsedInput.id,
      })
      .catch(() => {});
  });
