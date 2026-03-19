"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { clientsTable } from "@/db/schema";
import { authActionClient } from "@/lib/next-safe-action";
import { pusherServer } from "@/lib/pusher-server";
import { REALTIME_CHANNELS, REALTIME_EVENTS } from "@/lib/realtime";

import {
  ErrorMessages,
  ErrorTypes,
  InsertClientSchema,
  UpsertClientschema,
} from "./schema";

export const updateUser = authActionClient
  .schema(UpsertClientschema)
  .action(async ({ parsedInput }) => {
    await db
      .update(clientsTable)
      .set({
        name: parsedInput.name,
        register: parsedInput.register,
        phoneNumber: parsedInput.phoneNumber,
        ...(parsedInput.dateOfBirth && {
          dateOfBirth: parsedInput.dateOfBirth,
        }),
      })
      .where(eq(clientsTable.id, parsedInput.id));

    revalidatePath("/consumidores");
    void pusherServer
      .trigger(REALTIME_CHANNELS.clients, REALTIME_EVENTS.clientsChanged, {
        clientId: parsedInput.id,
      })
      .catch(() => {});
  });

export const insertClient = authActionClient
  .schema(InsertClientSchema)
  .action(async ({ parsedInput }) => {
    await db.insert(clientsTable).values({
      name: parsedInput.name,
      register: parsedInput.register,
      phoneNumber: parsedInput.phoneNumber,
      dateOfBirth: parsedInput.dateOfBirth || null,
    });

    revalidatePath("/consumidores");
    void pusherServer
      .trigger(REALTIME_CHANNELS.clients, REALTIME_EVENTS.clientsChanged, {})
      .catch(() => {});
  });
