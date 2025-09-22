"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { clientsTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

import { ErrorMessages, ErrorTypes } from "./schema";

export const getClientByRegister = actionClient
  .schema(
    z.object({
      register: z.string(),
    }),
  )
  .action(async ({ parsedInput }) => {
    try {
      const clients = await db.query.clientsTable.findMany({
        where: eq(clientsTable.register, parsedInput.register),
      });

      if (!clients || clients.length === 0) {
        return {
          error: {
            type: ErrorTypes.CLIENT_NOT_FOUND,
            message: ErrorMessages[ErrorTypes.CLIENT_NOT_FOUND],
          },
        };
      }

      return clients[0];
    } catch {
      return {
        error: {
          type: ErrorTypes.CLIENT_NOT_FOUND,
          message: ErrorMessages[ErrorTypes.CLIENT_NOT_FOUND],
        },
      };
    }
  });

export const getAllClients = actionClient.action(async () => {
  try {
    const clients = await db.query.clientsTable.findMany();
    return clients;
  } catch (error) {
    console.error("[GET_ALL_CLIENTS]", error);
    throw new Error("Erro ao buscar clientes");
  }
});
