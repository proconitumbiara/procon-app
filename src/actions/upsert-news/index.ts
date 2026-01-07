"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { newsDocumentsTable, newsTable, usersTable } from "@/db/schema";
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

    const { documents = [], ...newsPayload } = parsedInput;

    await db.transaction(async (tx) => {
      const [result] = await tx
        .insert(newsTable)
        .values({
          id: newsPayload.id,
          title: newsPayload.title.trim(),
          slug: newsPayload.slug.trim(),
          excerpt: normalizeNullableString(newsPayload.excerpt),
          content: normalizeNullableString(newsPayload.content),
          coverImageUrl: normalizeNullableString(newsPayload.coverImageUrl),
          publishedAt: toDateOrNull(newsPayload.publishedAt),
          isPublished: newsPayload.isPublished,
          emphasis: newsPayload.emphasis ?? false,
        })
        .onConflictDoUpdate({
          target: [newsTable.id],
          set: {
            title: newsPayload.title.trim(),
            slug: newsPayload.slug.trim(),
            excerpt: normalizeNullableString(newsPayload.excerpt),
            content: normalizeNullableString(newsPayload.content),
            coverImageUrl: normalizeNullableString(newsPayload.coverImageUrl),
            publishedAt: toDateOrNull(newsPayload.publishedAt),
            isPublished: newsPayload.isPublished,
            emphasis: newsPayload.emphasis ?? false,
            updatedAt: new Date(),
          },
        })
        .returning({ id: newsTable.id });

      const newsId = result?.id ?? newsPayload.id;

      if (!newsId) {
        throw new Error("Falha ao salvar notícia.");
      }

      await tx
        .delete(newsDocumentsTable)
        .where(eq(newsDocumentsTable.newsId, newsId));

      if (documents.length) {
        await tx.insert(newsDocumentsTable).values(
          documents.map((doc, index) => ({
            newsId,
            label: doc.label.trim(),
            fileUrl: doc.fileUrl.trim(),
            displayOrder: doc.displayOrder ?? index,
          })),
        );
      }
    });

    revalidatePath("/noticias");

    return { success: true };
  });
