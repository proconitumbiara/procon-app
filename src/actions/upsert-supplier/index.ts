"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import { suppliersTable, usersTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { formatPhone, normalizeAddress, normalizePhone } from "@/lib/formatters";
import { actionClient } from "@/lib/next-safe-action";

import { ErrorMessages, ErrorTypes, upsertSupplierSchema } from "./schema";

const normalizeNullableString = (value?: string | null) => {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

export const upsertSupplier = actionClient
  .schema(upsertSupplierSchema)
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

    const [supplier] = await db
      .insert(suppliersTable)
      .values({
        id: parsedInput.id,
        name: parsedInput.name.trim(),
        address: normalizeNullableString(
          normalizeAddress(parsedInput.address ?? ""),
        ),
        phone: normalizeNullableString(
          formatPhone(normalizePhone(parsedInput.phone)),
        ),
      })
      .onConflictDoUpdate({
        target: [suppliersTable.id],
        set: {
          name: parsedInput.name.trim(),
          address: normalizeNullableString(
            normalizeAddress(parsedInput.address ?? ""),
          ),
          phone: normalizeNullableString(
            formatPhone(normalizePhone(parsedInput.phone)),
          ),
          updatedAt: new Date(),
        },
      })
      .returning({
        id: suppliersTable.id,
        name: suppliersTable.name,
        address: suppliersTable.address,
        phone: suppliersTable.phone,
      });

    return { success: true, supplier };
  });


