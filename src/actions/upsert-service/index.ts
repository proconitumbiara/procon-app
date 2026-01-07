"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { servicesTable, usersTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { ErrorMessages, ErrorTypes, upsertServiceSchema } from "./schema";

const normalizeNullableString = (value?: string | null) => {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

export const upsertService = actionClient
  .schema(upsertServiceSchema)
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

    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, session.user.id),
    });

    if (user?.role !== "administrator") {
      return {
        error: {
          type: ErrorTypes.USER_NOT_AUTHORIZED,
          message: ErrorMessages[ErrorTypes.USER_NOT_AUTHORIZED],
        },
      };
    }

    await db.transaction(async (tx) => {
      const [result] = await tx
        .insert(servicesTable)
        .values({
          id: parsedInput.id,
          title: parsedInput.title.trim(),
          slug: parsedInput.slug.trim(),
          description: normalizeNullableString(parsedInput.description),
          requirements: normalizeNullableString(parsedInput.requirements),
          howToApply: normalizeNullableString(parsedInput.howToApply),
          contactEmail: normalizeNullableString(parsedInput.contactEmail),
          contactPhone: normalizeNullableString(parsedInput.contactPhone),
          isActive: parsedInput.isActive,
          emphasis: parsedInput.emphasis ?? false,
        })
        .onConflictDoUpdate({
          target: [servicesTable.id],
          set: {
            title: parsedInput.title.trim(),
            slug: parsedInput.slug.trim(),
            description: normalizeNullableString(parsedInput.description),
            requirements: normalizeNullableString(parsedInput.requirements),
            howToApply: normalizeNullableString(parsedInput.howToApply),
            contactEmail: normalizeNullableString(parsedInput.contactEmail),
            contactPhone: normalizeNullableString(parsedInput.contactPhone),
            isActive: parsedInput.isActive,
            emphasis: parsedInput.emphasis ?? false,
            updatedAt: new Date(),
          },
        })
        .returning({ id: servicesTable.id });

      const serviceId = result?.id ?? parsedInput.id;

      if (!serviceId) {
        throw new Error("Falha ao salvar serviço.");
      }
    });

    revalidatePath("/servicos");

    return { success: true };
  });
