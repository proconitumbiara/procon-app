"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { priceSearchItemsTable, productsTable, usersTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { deleteProductSchema } from "./schema";

export const deleteProduct = actionClient
  .schema(deleteProductSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, session.user.id),
    });

    if (user?.role !== "administrator") {
      throw new Error("Unauthorized");
    }

    const product = await db.query.productsTable.findFirst({
      where: eq(productsTable.id, parsedInput.id),
    });

    if (!product) {
      throw new Error("Produto não encontrado");
    }

    // Verificar se há itens de pesquisa vinculados
    const itemsCount = await db.query.priceSearchItemsTable.findMany({
      where: eq(priceSearchItemsTable.productId, parsedInput.id),
    });

    if (itemsCount.length > 0) {
      throw new Error(
        `Não é possível deletar o produto. Existem ${itemsCount.length} item(ns) de pesquisa vinculado(s).`,
      );
    }

    await db.delete(productsTable).where(eq(productsTable.id, parsedInput.id));

    revalidatePath("/gerenciar-pesquisas");

    return { success: true };
  });

