"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { registrationCodesTable } from "@/db/schema";
import { adminActionClient } from "@/lib/next-safe-action";

import { ErrorMessages, ErrorTypes, generateRegistrationCodeSchema } from "./schema";

function generateCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export const generateRegistrationCode = adminActionClient
  .schema(generateRegistrationCodeSchema)
  .action(async () => {
    try {
      let code: string;
      let attempts = 0;
      const MAX_ATTEMPTS = 10;

      do {
        code = generateCode();
        const existingCode = await db.query.registrationCodesTable.findFirst({
          where: eq(registrationCodesTable.code, code),
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

      const [registrationCode] = await db
        .insert(registrationCodesTable)
        .values({
          code,
          expiresAt,
        })
        .returning({
          id: registrationCodesTable.id,
          code: registrationCodesTable.code,
          expiresAt: registrationCodesTable.expiresAt,
          createdAt: registrationCodesTable.createdAt,
        });

      return {
        success: true,
        data: registrationCode,
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
