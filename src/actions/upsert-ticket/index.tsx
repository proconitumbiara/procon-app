"use server";

import "@/ws-server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { ticketsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
// Importar ws-server para garantir inicialização do servidor WebSocket
import { broadcastTicketUpdate } from "@/ws-server";

import {
  CreateTicketSchema,
  ErrorMessages,
  ErrorTypes,
  UpdateTicketSchema,
} from "./schema";

export const updateTicket = actionClient
  .schema(UpdateTicketSchema)
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

    // Buscar ticket atual para manter sectorId e clientId
    const ticket = await db.query.ticketsTable.findFirst({
      where: eq(ticketsTable.id, parsedInput.id),
    });
    if (!ticket) throw new Error("Ticket não encontrado");
    await db
      .update(ticketsTable)
      .set({
        status: "canceled",
        sectorId: ticket.sectorId,
        clientId: ticket.clientId,
      })
      .where(eq(ticketsTable.id, parsedInput.id));

    revalidatePath("/users/pending-appointments");

    // Emitir evento WebSocket para atualização em tempo real
    broadcastTicketUpdate({
      type: "ticket-updated",
      ticketId: parsedInput.id,
    });
  });

export const createTicket = actionClient
  .schema(CreateTicketSchema)
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

    const [newTicket] = await db
      .insert(ticketsTable)
      .values({
        status: parsedInput.status,
        sectorId: parsedInput.sectorId,
        clientId: parsedInput.clientId,
      })
      .returning();

    revalidatePath("/users/professionals-services");
    revalidatePath("/users/pending-appointments");

    // Emitir evento WebSocket para atualização em tempo real
    broadcastTicketUpdate({
      type: "ticket-created",
      ticketId: newTicket.id,
    });

    return { data: newTicket };
  });
