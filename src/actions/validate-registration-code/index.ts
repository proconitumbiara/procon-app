"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { registrationCodesTable } from "@/db/schema";
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
      // Normalizar código para maiúsculas para busca case-insensitive
      const normalizedCode = parsedInput.code.toUpperCase().trim();

      // Buscar código no banco
      const registrationCode = await db.query.registrationCodesTable.findFirst({
        where: eq(registrationCodesTable.code, normalizedCode),
      });

      if (!registrationCode) {
        return {
          error: {
            type: ErrorTypes.CODE_NOT_FOUND,
            message: ErrorMessages[ErrorTypes.CODE_NOT_FOUND],
          },
        };
      }

      // Verificar se já foi usado
      if (registrationCode.usedAt) {
        return {
          error: {
            type: ErrorTypes.CODE_ALREADY_USED,
            message: ErrorMessages[ErrorTypes.CODE_ALREADY_USED],
          },
        };
      }

      // Verificar se está expirado
      const now = new Date();
      if (registrationCode.expiresAt < now) {
        return {
          error: {
            type: ErrorTypes.CODE_EXPIRED,
            message: ErrorMessages[ErrorTypes.CODE_EXPIRED],
          },
        };
      }

      // Marcar código como usado (atualizar usedAt)
      await db
        .update(registrationCodesTable)
        .set({
          usedAt: now,
        })
        .where(eq(registrationCodesTable.id, registrationCode.id));

      return {
        success: true,
      };
    } catch (error) {
      return {
        error: {
          type: ErrorTypes.VALIDATION_ERROR,
          message: ErrorMessages[ErrorTypes.VALIDATION_ERROR],
        },
      };
    }
  });
