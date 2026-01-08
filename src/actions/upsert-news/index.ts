"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { newsTable, usersTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { ErrorMessages, ErrorTypes, upsertNewsSchema } from "./schema";

const normalizeNullableString = (value?: string | null) => {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

const toDateOrNull = (value?: string | null) => {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length ? new Date(trimmed) : null;
};

export const upsertNews = actionClient
  .schema(upsertNewsSchema)
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
        .insert(newsTable)
        .values({
          id: parsedInput.id,
          title: parsedInput.title.trim(),
          slug: parsedInput.slug.trim(),
          excerpt: normalizeNullableString(parsedInput.excerpt),
          content: normalizeNullableString(parsedInput.content),
          coverImageUrl: normalizeNullableString(parsedInput.coverImageUrl),
          publishedAt: toDateOrNull(parsedInput.publishedAt),
          isPublished: parsedInput.isPublished,
          emphasis: parsedInput.emphasis ?? false,
        })
        .onConflictDoUpdate({
          target: [newsTable.id],
          set: {
            title: parsedInput.title.trim(),
            slug: parsedInput.slug.trim(),
            excerpt: normalizeNullableString(parsedInput.excerpt),
            content: normalizeNullableString(parsedInput.content),
            coverImageUrl: normalizeNullableString(parsedInput.coverImageUrl),
            publishedAt: toDateOrNull(parsedInput.publishedAt),
            isPublished: parsedInput.isPublished,
            emphasis: parsedInput.emphasis ?? false,
            updatedAt: new Date(),
          },
        })
        .returning({ id: newsTable.id });

      const newsId = result?.id ?? parsedInput.id;

      if (!newsId) {
        throw new Error("Falha ao salvar notícia.");
      }
    });

    revalidatePath("/noticias");

    return { success: true };
  });
