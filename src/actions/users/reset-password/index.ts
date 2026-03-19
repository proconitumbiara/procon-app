"use server";

import { and, eq, gt, isNull } from "drizzle-orm";

import { db } from "@/db";
import { accountsTable, resetCodesTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { actionClient } from "@/lib/next-safe-action";

import { ErrorMessages, ErrorTypes, resetPasswordSchema } from "./schema";

export const resetPassword = actionClient
  .schema(resetPasswordSchema)
  .action(async ({ parsedInput }) => {
    try {
      const normalizedCode = parsedInput.code.toUpperCase().trim();
      const now = new Date();
      const ctx = await auth.$context;
      const hashedPassword = await ctx.password.hash(parsedInput.password);

      const result = await db.transaction(async (tx) => {
        const resetCode = await tx.query.resetCodesTable.findFirst({
          where: eq(resetCodesTable.code, normalizedCode),
        });
        if (!resetCode) return ErrorTypes.CODE_NOT_FOUND;
        if (resetCode.usedAt) return ErrorTypes.CODE_ALREADY_USED;
        if (resetCode.expiresAt < now) return ErrorTypes.CODE_EXPIRED;

        const userAccount = await tx.query.accountsTable.findFirst({
          where: eq(accountsTable.userId, resetCode.userId),
        });
        if (!userAccount) return ErrorTypes.RESET_ERROR;

        const [updatedCode] = await tx
          .update(resetCodesTable)
          .set({ usedAt: now })
          .where(
            and(
              eq(resetCodesTable.id, resetCode.id),
              isNull(resetCodesTable.usedAt),
              gt(resetCodesTable.expiresAt, now),
            ),
          )
          .returning({ id: resetCodesTable.id });

        if (!updatedCode) return ErrorTypes.CODE_ALREADY_USED;

        await tx
          .update(accountsTable)
          .set({ password: hashedPassword })
          .where(eq(accountsTable.userId, resetCode.userId));

        return "ok";
      });

      if (result !== "ok") {
        const message =
          result === ErrorTypes.RESET_ERROR
            ? "Conta do usuário não encontrada"
            : ErrorMessages[result];
        return { error: { type: result, message } };
      }

      return {
        success: true,
      };
    } catch (error: unknown) {
      logger.error("resetPassword failed", {
        action: "reset-password",
        error,
      });
      return {
        error: {
          type: ErrorTypes.RESET_ERROR,
          message: ErrorMessages[ErrorTypes.RESET_ERROR],
        },
      };
    }
  });
