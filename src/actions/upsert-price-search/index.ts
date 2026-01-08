"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import {
  priceSearchesTable,
  priceSearchItemsTable,
  usersTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { ErrorMessages, ErrorTypes, upsertPriceSearchSchema } from "./schema";

const normalizeNullableString = (value?: string | null) => {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

export const upsertPriceSearch = actionClient
  .schema(upsertPriceSearchSchema)
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
        .insert(priceSearchesTable)
        .values({
          id: parsedInput.id,
          title: parsedInput.title.trim(),
          slug: parsedInput.slug.trim(),
          summary: normalizeNullableString(parsedInput.summary),
          description: normalizeNullableString(parsedInput.description),
          coverImageUrl: normalizeNullableString(parsedInput.coverImageUrl),
          emphasis: parsedInput.emphasis ?? false,
          year: parsedInput.year,
          collectionDate: parsedInput.collectionDate || null,
          observation: normalizeNullableString(parsedInput.observation),
        })
        .onConflictDoUpdate({
          target: [priceSearchesTable.id],
          set: {
            title: parsedInput.title.trim(),
            slug: parsedInput.slug.trim(),
            summary: normalizeNullableString(parsedInput.summary),
            description: normalizeNullableString(parsedInput.description),
            coverImageUrl: normalizeNullableString(parsedInput.coverImageUrl),
            emphasis: parsedInput.emphasis ?? false,
            year: parsedInput.year,
            collectionDate: parsedInput.collectionDate || null,
            observation: normalizeNullableString(parsedInput.observation),
            updatedAt: new Date(),
          },
        })
        .returning({ id: priceSearchesTable.id });

      const priceSearchId = result?.id ?? parsedInput.id;

      if (!priceSearchId) {
        throw new Error("Falha ao salvar pesquisa de preços.");
      }

      // Deletar todos os itens antigos da pesquisa
      await tx
        .delete(priceSearchItemsTable)
        .where(eq(priceSearchItemsTable.priceSearchId, priceSearchId));

      // Inserir novos itens
      if (parsedInput.items && parsedInput.items.length > 0) {
        await tx.insert(priceSearchItemsTable).values(
          parsedInput.items.map((item) => ({
            priceSearchId,
            productId: item.productId,
            supplierId: item.supplierId,
            price: item.price,
          })),
        );
      }
    });

    revalidatePath("/pesquisas");
    revalidatePath("/gerenciar-pesquisas");

    return { success: true };
  });
