"use server";

import { and, eq, gt, isNull } from "drizzle-orm";

import { db } from "@/db";
import { registrationCodesTable } from "@/db/schema";
import { logger } from "@/lib/logger";
import { actionClient } from "@/lib/next-safe-action";

import {
  ErrorMessages,
  ErrorTypes,
  validateRegistrationCodeSchema,
} from "./schema";

export const validateRegistrationCode = actionClient
  .schema(validateRegistrationCodeSchema)
  .action(async ({ parsedInput }) => {
    try {
      const normalizedCode = parsedInput.code.toUpperCase().trim();
      const now = new Date();
      const result = await db.transaction(async (tx) => {
        const registrationCode = await tx.query.registrationCodesTable.findFirst({
          where: eq(registrationCodesTable.code, normalizedCode),
        });

        if (!registrationCode) return ErrorTypes.CODE_NOT_FOUND;
        if (registrationCode.usedAt) return ErrorTypes.CODE_ALREADY_USED;
        if (registrationCode.expiresAt < now) return ErrorTypes.CODE_EXPIRED;

        const [updated] = await tx
          .update(registrationCodesTable)
          .set({ usedAt: now })
          .where(
            and(
              eq(registrationCodesTable.id, registrationCode.id),
              isNull(registrationCodesTable.usedAt),
              gt(registrationCodesTable.expiresAt, now),
            ),
          )
          .returning({ id: registrationCodesTable.id });

        return updated ? "ok" : ErrorTypes.CODE_ALREADY_USED;
      });

      if (result !== "ok") {
        return {
          error: {
            type: result,
            message: ErrorMessages[result],
          },
        };
      }

      return {
        success: true,
      };
    } catch (error: unknown) {
      logger.error("validateRegistrationCode failed", {
        action: "validate-registration-code",
        error,
      });
      return {
        error: {
          type: ErrorTypes.VALIDATION_ERROR,
          message: ErrorMessages[ErrorTypes.VALIDATION_ERROR],
        },
      };
    }
  });
