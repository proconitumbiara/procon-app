"use server";

import { randomBytes } from "crypto";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import { accountsTable, usersTable, verificationsTable } from "@/db/schema";
import { auth, resetTokensCache } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { ErrorMessages, ErrorTypes, schema } from "./schema";

export const generateResetPasswordLink = actionClient
  .schema(schema)
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

    // Verificar se o usuário é administrador
    const adminUser = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, session.user.id),
    });

    if (adminUser?.role !== "administrator") {
      return {
        error: {
          type: ErrorTypes.USER_NOT_AUTHORIZED,
          message: ErrorMessages[ErrorTypes.USER_NOT_AUTHORIZED],
        },
      };
    }

    // Verificar se o usuário alvo existe
    const targetUser = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, parsedInput.userId),
    });

    if (!targetUser) {
      return {
        error: {
          type: ErrorTypes.USER_NOT_FOUND,
          message: ErrorMessages[ErrorTypes.USER_NOT_FOUND],
        },
      };
    }

    // Verificar se o usuário tem uma conta de email/password ativa
    const userAccount = await db.query.accountsTable.findFirst({
      where: eq(accountsTable.userId, targetUser.id),
    });

    if (!userAccount || !userAccount.password) {
      return {
        error: {
          type: ErrorTypes.GENERATION_ERROR,
          message: "Usuário não possui uma conta com senha cadastrada",
        },
      };
    }

    try {
      const baseURL = process.env.NEXT_PUBLIC_APP_URL || "";
      const redirectTo = `${baseURL}/reset-password`;

      // Gerar token seguro para reset de senha
      const token = randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos
      const now = new Date();

      // Inserir token na tabela de verificações
      await db.insert(verificationsTable).values({
        id: randomBytes(16).toString("hex"),
        identifier: targetUser.email,
        value: token,
        expiresAt,
        createdAt: now,
        updatedAt: now,
      });

      // Construir URL de reset
      const resetUrl = `${redirectTo}?token=${token}`;

      // Armazenar no cache (similar ao que o BetterAuth faz)
      resetTokensCache.set(targetUser.email, {
        url: resetUrl,
        token,
        expiresAt,
      });

      // Limpar cache após 1 minuto
      setTimeout(() => {
        resetTokensCache.delete(targetUser.email);
      }, 60000);

      return {
        data: {
          resetUrl,
          expiresAt,
        },
      };
    } catch (error: unknown) {
      console.error("Erro ao gerar link de reset:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : ErrorMessages[ErrorTypes.GENERATION_ERROR];
      return {
        error: {
          type: ErrorTypes.GENERATION_ERROR,
          message: errorMessage,
        },
      };
    }
  });
