"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { accountsTable, resetCodesTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { ErrorMessages, ErrorTypes, resetPasswordSchema } from "./schema";

export const resetPassword = actionClient
  .schema(resetPasswordSchema)
  .action(async ({ parsedInput }) => {
    try {
      // Normalizar código para maiúsculas para busca case-insensitive
      const normalizedCode = parsedInput.code.toUpperCase().trim();

      // Buscar código no banco
      const resetCode = await db.query.resetCodesTable.findFirst({
        where: eq(resetCodesTable.code, normalizedCode),
      });

      if (!resetCode) {
        return {
          error: {
            type: ErrorTypes.CODE_NOT_FOUND,
            message: ErrorMessages[ErrorTypes.CODE_NOT_FOUND],
          },
        };
      }

      // Verificar se já foi usado
      if (resetCode.usedAt) {
        return {
          error: {
            type: ErrorTypes.CODE_ALREADY_USED,
            message: ErrorMessages[ErrorTypes.CODE_ALREADY_USED],
          },
        };
      }

      // Verificar se está expirado
      const now = new Date();
      if (resetCode.expiresAt < now) {
        return {
          error: {
            type: ErrorTypes.CODE_EXPIRED,
            message: ErrorMessages[ErrorTypes.CODE_EXPIRED],
          },
        };
      }

      // Buscar conta do usuário
      const userAccount = await db.query.accountsTable.findFirst({
        where: eq(accountsTable.userId, resetCode.userId),
      });

      if (!userAccount) {
        return {
          error: {
            type: ErrorTypes.RESET_ERROR,
            message: "Conta do usuário não encontrada",
          },
        };
      }

      // Gerar hash da nova senha usando betterAuth
      const ctx = await auth.$context;
      const hashedPassword = await ctx.password.hash(parsedInput.password);

      // Atualizar senha na tabela accounts
      await db
        .update(accountsTable)
        .set({ password: hashedPassword })
        .where(eq(accountsTable.userId, resetCode.userId));

      // Marcar código como usado
      await db
        .update(resetCodesTable)
        .set({
          usedAt: now,
        })
        .where(eq(resetCodesTable.id, resetCode.id));

      return {
        success: true,
      };
    } catch (error) {
      console.error("Erro ao redefinir senha:", error);
      return {
        error: {
          type: ErrorTypes.RESET_ERROR,
          message: ErrorMessages[ErrorTypes.RESET_ERROR],
        },
      };
    }
  });
