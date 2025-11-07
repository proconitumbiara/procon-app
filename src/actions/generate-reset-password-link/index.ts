"use server";

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
      // Usar a API do BetterAuth para gerar o token de reset
      // O BetterAuth usa forgetPassword para iniciar o processo de reset
      const requestHeaders = await headers();
      const baseURL = process.env.NEXT_PUBLIC_APP_URL || "";
      const redirectTo = `${baseURL}/reset-password`;

      // Chamar a API do BetterAuth para gerar o token
      // O BetterAuth vai gerar o token e chamar sendResetPassword automaticamente
      try {
        await auth.api.forgetPassword({
          body: {
            email: targetUser.email,
            redirectTo,
          },
          headers: requestHeaders,
        });
      } catch (apiError: unknown) {
        console.error("Erro na chamada forgetPassword:", apiError);
        const errorMessage =
          apiError instanceof Error
            ? apiError.message
            : "Erro ao chamar API de reset de senha";
        return {
          error: {
            type: ErrorTypes.GENERATION_ERROR,
            message: errorMessage,
          },
        };
      }

      // Aguardar um momento para garantir que o token foi inserido no banco
      // O BetterAuth chama sendResetPassword de forma assíncrona
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Tentar buscar o token do cache primeiro (armazenado em sendResetPassword)
      const cachedToken = resetTokensCache.get(targetUser.email);

      let resetUrl: string;
      let expiresAt: Date;

      if (cachedToken) {
        resetUrl = cachedToken.url;
        expiresAt = cachedToken.expiresAt;
      } else {
        // Buscar todos os tokens recentes (pode haver tokens antigos também)
        const allVerifications = await db.query.verificationsTable.findMany({
          where: eq(verificationsTable.identifier, targetUser.email),
        });

        // Filtrar apenas tokens que não expiraram e ordenar por mais recente
        const validVerifications = allVerifications
          .filter((v) => new Date(v.expiresAt) > new Date())
          .sort(
            (a, b) =>
              new Date(b.createdAt || 0).getTime() -
              new Date(a.createdAt || 0).getTime(),
          );

        if (validVerifications.length === 0) {
          console.error(
            "Nenhum token válido encontrado na tabela de verificações",
          );

          // Tentar buscar qualquer token, mesmo que antigo (para debug)
          if (allVerifications.length > 0) {
            const mostRecent = allVerifications.sort(
              (a, b) =>
                new Date(b.createdAt || 0).getTime() -
                new Date(a.createdAt || 0).getTime(),
            )[0];
            console.error(
              "Token mais recente encontrado (pode estar expirado):",
              {
                id: mostRecent.id,
                identifier: mostRecent.identifier,
                expiresAt: mostRecent.expiresAt,
                createdAt: mostRecent.createdAt,
                hasValue: !!mostRecent.value,
              },
            );
          }

          return {
            error: {
              type: ErrorTypes.GENERATION_ERROR,
              message:
                "Token não foi gerado corretamente. Nenhum token válido encontrado no banco de dados.",
            },
          };
        }

        const verification = validVerifications[0];

        if (!verification || !verification.value) {
          console.error("Token encontrado mas sem valor:", verification);
          return {
            error: {
              type: ErrorTypes.GENERATION_ERROR,
              message: "Token encontrado mas sem valor válido",
            },
          };
        }

        // Gerar URL completa com o token gerado pelo BetterAuth
        resetUrl = `${baseURL}/reset-password?token=${verification.value}`;
        expiresAt = verification.expiresAt;
      }

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
