import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import { clientsTable, ticketsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

/**
 * GET /api/clients/[id]
 * Retorna o consumidor com todos os tickets e atendimentos (treatments) vinculados.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const [client] = await db
    .select()
    .from(clientsTable)
    .where(eq(clientsTable.id, id))
    .limit(1);

  if (!client) {
    return NextResponse.json({ error: "Consumidor não encontrado" }, { status: 404 });
  }

  const ticketsRaw = await db.query.ticketsTable.findMany({
    where: eq(ticketsTable.clientId, id),
    orderBy: (t, { desc }) => [desc(t.createdAt)],
    with: {
      sector: true,
      treatment: {
        with: {
          operation: {
            with: {
              servicePoint: {
                with: {
                  sector: true,
                },
              },
              user: true,
            },
          },
        },
      },
    },
  });

  const tickets = ticketsRaw.map((ticket) => ({
    id: ticket.id,
    status: ticket.status,
    priority: ticket.priority ?? 0,
    sectorId: ticket.sectorId,
    sectorName: ticket.sector?.name ?? "-",
    createdAt: ticket.createdAt,
    calledAt: ticket.calledAt,
    finishedAt: ticket.finishedAt,
    treatment: ticket.treatment
      ? {
          id: ticket.treatment.id,
          status: ticket.treatment.status,
          duration: ticket.treatment.duration,
          startedAt: ticket.treatment.startedAt,
          finishedAt: ticket.treatment.finishedAt,
          servicePointName:
            ticket.treatment.operation?.servicePoint?.name ?? "-",
          servicePointId: ticket.treatment.operation?.servicePointId,
          professionalName: ticket.treatment.operation?.user?.name ?? "-",
          sectorName:
            ticket.treatment.operation?.servicePoint?.sector?.name ?? "-",
        }
      : null,
  }));

  return NextResponse.json({
    client: {
      id: client.id,
      name: client.name,
      register: client.register,
      dateOfBirth: client.dateOfBirth,
      phoneNumber: client.phoneNumber,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
    },
    tickets,
  });
}
