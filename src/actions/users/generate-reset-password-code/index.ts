"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import { accountsTable, resetCodesTable, usersTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { ErrorMessages, ErrorTypes, schema } from "./schema";

// Função para gerar código alfanumérico de 6 dígitos
function generateCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export const generateResetPasswordCode = actionClient
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
      // Gerar código único
      let code: string;
      let attempts = 0;
      const maxAttempts = 10;

      do {
        code = generateCode();
        const existingCode = await db.query.resetCodesTable.findFirst({
          where: eq(resetCodesTable.code, code),
        });

        if (!existingCode) {
          break;
        }

        attempts++;
        if (attempts >= maxAttempts) {
          return {
            error: {
              type: ErrorTypes.GENERATION_ERROR,
              message:
                "Não foi possível gerar um código único após várias tentativas",
            },
          };
        }
      } while (true);

      // Calcular data de expiração (1 hora a partir de agora)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      // Salvar código no banco
      const [resetCode] = await db
        .insert(resetCodesTable)
        .values({
          code,
          userId: targetUser.id,
          expiresAt,
        })
        .returning({
          id: resetCodesTable.id,
          code: resetCodesTable.code,
          expiresAt: resetCodesTable.expiresAt,
          createdAt: resetCodesTable.createdAt,
        });

      return {
        success: true,
        data: resetCode,
      };
    } catch (error) {
      return {
        error: {
          type: ErrorTypes.GENERATION_ERROR,
          message: ErrorMessages[ErrorTypes.GENERATION_ERROR],
        },
      };
    }
  });
