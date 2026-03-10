"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { accountsTable, resetCodesTable, usersTable } from "@/db/schema";
import { adminActionClient } from "@/lib/next-safe-action";

import { ErrorMessages, ErrorTypes, schema } from "./schema";

function generateCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export const generateResetPasswordCode = adminActionClient
  .schema(schema)
  .action(async ({ parsedInput }) => {
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
      let code: string;
      let attempts = 0;
      const MAX_ATTEMPTS = 10;

      do {
        code = generateCode();
        const existingCode = await db.query.resetCodesTable.findFirst({
          where: eq(resetCodesTable.code, code),
        });

        if (!existingCode) break;

        attempts++;
        if (attempts >= MAX_ATTEMPTS) {
          return {
            error: {
              type: ErrorTypes.GENERATION_ERROR,
              message: "Não foi possível gerar um código único após várias tentativas",
            },
          };
        }
      } while (true);

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

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
    } catch {
      return {
        error: {
          type: ErrorTypes.GENERATION_ERROR,
          message: ErrorMessages[ErrorTypes.GENERATION_ERROR],
        },
      };
    }
  });
