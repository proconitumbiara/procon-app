"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { clientsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import {
  ErrorMessages,
  ErrorTypes,
  InsertClientSchema,
  UpsertClientschema,
} from "./schema";

export const updateUser = actionClient
  .schema(UpsertClientschema)
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
      .update(clientsTable)
      .set({
        name: parsedInput.name,
        register: parsedInput.register,
        phoneNumber: parsedInput.phoneNumber,
      })
      .where(eq(clientsTable.id, parsedInput.id));

    revalidatePath("/professional/front-desk-sector");
    revalidatePath("/administrator/clients");
    revalidatePath("/administrator/dashboard");
  });

export const insertClient = actionClient
  .schema(InsertClientSchema)
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

    await db.insert(clientsTable).values({
      name: parsedInput.name,
      register: parsedInput.register,
      phoneNumber: parsedInput.phoneNumber,
    });

    revalidatePath("/users/clients");
  });
