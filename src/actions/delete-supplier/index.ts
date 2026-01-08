"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { priceSearchItemsTable, suppliersTable, usersTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { deleteSupplierSchema } from "./schema";

export const deleteSupplier = actionClient
  .schema(deleteSupplierSchema)
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

    const supplier = await db.query.suppliersTable.findFirst({
      where: eq(suppliersTable.id, parsedInput.id),
    });

    if (!supplier) {
      throw new Error("Fornecedor não encontrado");
    }

    // Verificar se há itens de pesquisa vinculados
    const itemsCount = await db.query.priceSearchItemsTable.findMany({
      where: eq(priceSearchItemsTable.supplierId, parsedInput.id),
    });

    if (itemsCount.length > 0) {
      throw new Error(
        `Não é possível deletar o fornecedor. Existem ${itemsCount.length} item(ns) de pesquisa vinculado(s).`,
      );
    }

    await db
      .delete(suppliersTable)
      .where(eq(suppliersTable.id, parsedInput.id));

    revalidatePath("/gerenciar-pesquisas");

    return { success: true };
  });

