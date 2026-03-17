"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { clientsTable, sectorsTable, ticketsTable } from "@/db/schema";
import { permissionedActionClient } from "@/lib/next-safe-action";
import { pusherServer } from "@/lib/pusher-server";
import { calculateAge } from "@/lib/utils";

import {
  CreateTicketSchema,
  ErrorMessages,
  ErrorTypes,
  UpdateTicketSchema,
} from "./schema";

export const updateTicket = permissionedActionClient("tickets.manage")
  .schema(UpdateTicketSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { perms } = ctx;
    const ticket = await db.query.ticketsTable.findFirst({
      where: eq(ticketsTable.id, parsedInput.id),
      with: { sector: true },
    });
    if (!ticket) throw new Error("Ticket não encontrado");

    if (!perms.canAccessSectorKey(ticket.sector?.key_name)) {
      return {
        error: {
          type: ErrorTypes.UNAUTHENTICATED,
          message: "Acesso negado para este setor",
        },
      };
    }

    await db
      .update(ticketsTable)
      .set({
        status: "cancelled",
        finishedAt: new Date(),
        sectorId: ticket.sectorId,
        clientId: ticket.clientId,
      })
      .where(eq(ticketsTable.id, parsedInput.id));

    revalidatePath("/fila-atendimentos");

    void pusherServer.trigger("tickets", "ticket-updated", {
      ticketId: parsedInput.id,
    }).catch((err) => console.error("[updateTicket] Pusher:", err));
  });

export const createTicket = permissionedActionClient("tickets.manage")
  .schema(CreateTicketSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { perms } = ctx;
    const client = await db.query.clientsTable.findFirst({
      where: eq(clientsTable.id, parsedInput.clientId),
    });

    const sector = await db.query.sectorsTable.findFirst({
      where: eq(sectorsTable.id, parsedInput.sectorId),
    });
    if (!sector) {
      return {
        error: {
          type: ErrorTypes.UNAUTHENTICATED,
          message: "Setor não encontrado",
        },
      };
    }
    if (!perms.canAccessSectorKey(sector.key_name)) {
      return {
        error: {
          type: ErrorTypes.UNAUTHENTICATED,
          message: "Acesso negado para este setor",
        },
      };
    }

    let finalPriority = parsedInput.priority ?? 0;
    if (client?.dateOfBirth) {
      const age = calculateAge(new Date(client.dateOfBirth));
      if (age >= 60) {
        finalPriority = 1;
      }
    }

    const [newTicket] = await db
      .insert(ticketsTable)
      .values({
        status: parsedInput.status,
        sectorId: parsedInput.sectorId,
        clientId: parsedInput.clientId,
        priority: finalPriority,
      })
      .returning();

    revalidatePath("/atendimento");
    revalidatePath("/fila-atendimentos");

    void pusherServer.trigger("tickets", "ticket-created", {
      ticketId: newTicket.id,
    }).catch((err) => console.error("[createTicket] Pusher:", err));

    return { data: newTicket };
  });
