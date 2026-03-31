"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { clientsTable, sectorsTable, ticketsTable } from "@/db/schema";
import { permissionedActionClient } from "@/lib/next-safe-action";
import { logger } from "@/lib/logger";
import { pusherServer } from "@/lib/pusher-server";
import {
  REALTIME_CHANNELS,
  REALTIME_EVENTS,
  type TicketChangedPayload,
  type TicketRealtimeStatus,
} from "@/lib/realtime";
import { calculateAge } from "@/lib/utils";

import {
  CreateTicketSchema,
  ErrorTypes,
  UpdateTicketSchema,
} from "./schema";

async function emitTicketRealtimeEvents(payload: TicketChangedPayload) {
  const events = [
    { event: REALTIME_EVENTS.ticketsChanged, payload },
    { event: REALTIME_EVENTS.ticketUpdated, payload: { ticketId: payload.ticketId } },
    { event: REALTIME_EVENTS.ticketCreated, payload: { ticketId: payload.ticketId } },
  ] as const;

  const results = await Promise.allSettled(
    events.map(({ event, payload: eventPayload }) =>
      pusherServer.trigger(REALTIME_CHANNELS.tickets, event, eventPayload),
    ),
  );

  results.forEach((result, index) => {
    if (result.status === "rejected") {
      logger.error("Ticket realtime emit failed", {
        action: "ticket-upsert",
        channel: REALTIME_CHANNELS.tickets,
        event: events[index].event,
        ticketId: payload.ticketId,
        status: payload.status,
        updatedAt: payload.updatedAt,
        error: result.reason,
      });
    }
  });
}

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

    const updatedAt = new Date();

    await db
      .update(ticketsTable)
      .set({
        status: "cancelled",
        finishedAt: updatedAt,
        sectorId: ticket.sectorId,
        clientId: ticket.clientId,
        updatedAt,
      })
      .where(eq(ticketsTable.id, parsedInput.id));

    revalidatePath("/fila-atendimentos");

    await emitTicketRealtimeEvents({
      ticketId: parsedInput.id,
      status: "cancelled",
      updatedAt: updatedAt.toISOString(),
    });
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

    await emitTicketRealtimeEvents({
      ticketId: newTicket.id,
      status: newTicket.status as TicketRealtimeStatus,
      updatedAt: (newTicket.updatedAt ?? newTicket.createdAt).toISOString(),
    });

    return { data: newTicket };
  });
