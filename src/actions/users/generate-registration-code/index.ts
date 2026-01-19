"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import { registrationCodesTable, usersTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { ErrorMessages, ErrorTypes, generateRegistrationCodeSchema } from "./schema";

// Função para gerar código alfanumérico de 6 dígitos
function generateCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export const generateRegistrationCode = actionClient
  .schema(generateRegistrationCodeSchema)
  .action(async () => {
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
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, session.user.id),
    });

    if (user?.role !== "administrator") {
      return {
        error: {
          type: ErrorTypes.USER_NOT_AUTHORIZED,
          message: ErrorMessages[ErrorTypes.USER_NOT_AUTHORIZED],
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
        const existingCode = await db.query.registrationCodesTable.findFirst({
          where: eq(registrationCodesTable.code, code),
        });

        if (!existingCode) {
          break;
        }

        attempts++;
        if (attempts >= maxAttempts) {
          return {
            error: {
              type: ErrorTypes.GENERATION_ERROR,
              message: "Não foi possível gerar um código único após várias tentativas",
            },
          };
        }
      } while (true);

      // Calcular data de expiração (1 hora a partir de agora)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      // Salvar código no banco
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
    } catch (error) {
      return {
        error: {
          type: ErrorTypes.GENERATION_ERROR,
          message: ErrorMessages[ErrorTypes.GENERATION_ERROR],
        },
      };
    }
  });
